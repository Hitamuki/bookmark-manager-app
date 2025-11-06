#!/bin/bash
# scripts/connect_to_aurora.sh
# Aurora PostgreSQLへのSSMセッションマネージャー経由での接続スクリプト
#
# 使い方:
#   ./scripts/connect_to_aurora.sh [環境名] [ローカルポート]
#
# 例:
#   ./scripts/connect_to_aurora.sh staging 5432
#   ./scripts/connect_to_aurora.sh production 5433
#
# 前提条件:
#   - AWS CLIがインストールされていること
#   - AWS Session Manager Pluginがインストールされていること
#   - 適切なAWS認証情報が設定されていること
#   - ECSタスクが実行中であること

set -e

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 引数取得
ENV=${1:-staging}
LOCAL_PORT=${2:-5432}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔌 Aurora PostgreSQL接続スクリプト${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}環境: ${ENV}${NC}"
echo -e "${GREEN}ローカルポート: ${LOCAL_PORT}${NC}"
echo ""

# プロジェクト名
PROJECT_NAME="bookmark-manager"

# 1. SSMからAurora接続情報を取得
echo -e "${YELLOW}📡 SSM Parameter Storeから接続情報を取得中...${NC}"

DB_ENDPOINT=$(aws ssm get-parameter \
  --name "/${PROJECT_NAME}/${ENV}/db/endpoint" \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

DB_PASSWORD=$(aws ssm get-parameter \
  --name "/${PROJECT_NAME}/${ENV}/db/password" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

DATABASE_URL=$(aws ssm get-parameter \
  --name "/${PROJECT_NAME}/${ENV}/DATABASE_URL" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text 2>/dev/null || echo "")

if [ -z "$DB_ENDPOINT" ]; then
  echo -e "${RED}❌ エラー: DB接続情報が取得できませんでした${NC}"
  echo -e "${YELLOW}SSM Parameter Storeに以下のパラメータが存在することを確認してください:${NC}"
  echo "  - /${PROJECT_NAME}/${ENV}/db/endpoint"
  echo "  - /${PROJECT_NAME}/${ENV}/db/password"
  echo "  - /${PROJECT_NAME}/${ENV}/DATABASE_URL"
  exit 1
fi

echo -e "${GREEN}✅ DBエンドポイント: ${DB_ENDPOINT}${NC}"
echo ""

# 2. ECSクラスターとサービス情報を取得
echo -e "${YELLOW}📡 ECSタスク情報を取得中...${NC}"

CLUSTER_NAME="${PROJECT_NAME}-${ENV}-cluster"
SERVICE_NAME="${PROJECT_NAME}-${ENV}-api-service"

# 実行中のタスクARNを取得
TASK_ARN=$(aws ecs list-tasks \
  --cluster "${CLUSTER_NAME}" \
  --service-name "${SERVICE_NAME}" \
  --desired-status RUNNING \
  --query "taskArns[0]" \
  --output text 2>/dev/null || echo "")

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "None" ]; then
  echo -e "${RED}❌ エラー: 実行中のECSタスクが見つかりませんでした${NC}"
  echo -e "${YELLOW}以下のコマンドでタスクが実行中か確認してください:${NC}"
  echo "  aws ecs list-tasks --cluster ${CLUSTER_NAME} --service-name ${SERVICE_NAME}"
  exit 1
fi

echo -e "${GREEN}✅ タスクARN: ${TASK_ARN}${NC}"

# タスクの詳細情報を取得
TASK_DETAILS=$(aws ecs describe-tasks \
  --cluster "${CLUSTER_NAME}" \
  --tasks "${TASK_ARN}" \
  --query "tasks[0]" \
  --output json)

# ランタイムIDを取得
RUNTIME_ID=$(echo "$TASK_DETAILS" | jq -r '.containers[0].runtimeId' 2>/dev/null || echo "")

if [ -z "$RUNTIME_ID" ] || [ "$RUNTIME_ID" = "null" ]; then
  echo -e "${RED}❌ エラー: ランタイムIDが取得できませんでした${NC}"
  exit 1
fi

# タスクIDを取得（ARNから抽出）
TASK_ID=$(echo "$TASK_ARN" | awk -F/ '{print $NF}')

# ECS Execが有効か確認
ENABLE_EXECUTE_COMMAND=$(echo "$TASK_DETAILS" | jq -r '.enableExecuteCommand' 2>/dev/null || echo "false")

if [ "$ENABLE_EXECUTE_COMMAND" != "true" ]; then
  echo -e "${YELLOW}⚠️  警告: ECS Execが有効になっていません${NC}"
  echo -e "${YELLOW}ECSサービスでenableExecuteCommandを有効にする必要があります${NC}"
  echo ""
fi

echo -e "${GREEN}✅ タスクID: ${TASK_ID}${NC}"
echo -e "${GREEN}✅ ランタイムID: ${RUNTIME_ID}${NC}"
echo ""

# 3. SSMセッションマネージャーでポートフォワーディング開始
echo -e "${YELLOW}🚀 SSMポートフォワーディングを開始しています...${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}接続情報:${NC}"
echo -e "  ホスト: localhost"
echo -e "  ポート: ${LOCAL_PORT}"
echo -e "  データベース: bookmarkdb"
echo -e "  ユーザー名: dbadmin"
echo -e "  パスワード: (SSMから取得済み)"
echo ""
echo -e "${GREEN}psqlで接続する場合:${NC}"
echo -e "  psql postgresql://dbadmin:***@localhost:${LOCAL_PORT}/bookmarkdb"
echo ""
echo -e "${GREEN}DBeaver等で接続する場合:${NC}"
echo -e "  Host: localhost"
echo -e "  Port: ${LOCAL_PORT}"
echo -e "  Database: bookmarkdb"
echo -e "  Username: dbadmin"
echo -e "  Password: ${DB_PASSWORD}"
echo ""
echo -e "${GREEN}DATABASE_URL:${NC}"
echo -e "  ${DATABASE_URL//:*@/:***@}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Ctrl+C で切断します${NC}"
echo ""

# ECS Execターゲット形式
ECS_TARGET="ecs:${CLUSTER_NAME}_${TASK_ID}_${RUNTIME_ID}"

# SSMセッション開始
aws ssm start-session \
  --target "${ECS_TARGET}" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{
    \"host\":[\"${DB_ENDPOINT}\"],
    \"portNumber\":[\"5432\"],
    \"localPortNumber\":[\"${LOCAL_PORT}\"]
  }"

echo ""
echo -e "${GREEN}✅ 接続が切断されました${NC}"
