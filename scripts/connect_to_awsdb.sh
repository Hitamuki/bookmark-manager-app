#!/bin/bash
# scripts/connect_to_awsdb.sh
# Aurora PostgreSQLへのSSMセッションマネージャー経由での接続スクリプト
# Bastion (EC2) 経由でRDSに接続します
#
# 使い方:
#   ./scripts/connect_to_awsdb.sh [環境名] [ローカルポート]
#
# 例:
#   ./scripts/connect_to_awsdb.sh staging 5432
#   ./scripts/connect_to_awsdb.sh production 5433
#
# 前提条件:
#   - AWS CLIがインストールされていること
#   - AWS Session Manager Pluginがインストールされていること
#   - 適切なAWS認証情報が設定されていること
#   - Bastion EC2インスタンスが起動していること

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

# 2. Bastion EC2インスタンス情報を取得
echo -e "${YELLOW}📡 Bastion EC2インスタンス情報を取得中...${NC}"

# Bastionインスタンスを名前タグで検索
BASTION_INSTANCE_ID=$(aws ec2 describe-instances \
  --filters \
    "Name=tag:Name,Values=${PROJECT_NAME}-${ENV}-bastion" \
    "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text 2>/dev/null || echo "")

if [ -z "$BASTION_INSTANCE_ID" ] || [ "$BASTION_INSTANCE_ID" = "None" ]; then
  echo -e "${RED}❌ エラー: 実行中のBastionインスタンスが見つかりませんでした${NC}"
  echo -e "${YELLOW}以下のコマンドでインスタンスが実行中か確認してください:${NC}"
  echo "  aws ec2 describe-instances --filters \"Name=tag:Name,Values=${PROJECT_NAME}-${ENV}-bastion\" \"Name=instance-state-name,Values=running\""
  echo ""
  echo -e "${YELLOW}Bastionインスタンスが停止している場合は、起動してください:${NC}"
  echo "  aws ec2 start-instances --instance-ids <instance-id>"
  exit 1
fi

echo -e "${GREEN}✅ Bastionインスタンス: ${BASTION_INSTANCE_ID}${NC}"
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
echo -e "  postgresql://dbadmin:***@localhost:${LOCAL_PORT}/bookmarkdb?schema=public"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${YELLOW}Ctrl+C で切断します${NC}"
echo ""

# SSMセッション開始（Bastion経由でRDSへポートフォワーディング）
aws ssm start-session \
  --target "${BASTION_INSTANCE_ID}" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{
    \"host\":[\"${DB_ENDPOINT}\"],
    \"portNumber\":[\"5432\"],
    \"localPortNumber\":[\"${LOCAL_PORT}\"]
  }"

echo ""
echo -e "${GREEN}✅ 接続が切断されました${NC}"
