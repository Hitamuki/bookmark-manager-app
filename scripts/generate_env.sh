# scripts/generate-env.sh
#!/bin/bash
set -e

# 引数で環境を指定（デフォルトは staging）
ENV=${1:-staging}

echo "🔍 Generating .env.${ENV} file..."

# AWS情報を取得
echo "📡 Fetching AWS account information..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)

echo "✅ AWS Account ID: ${AWS_ACCOUNT_ID}"
echo "✅ Region: ${AWS_REGION}"

# Terragrunt outputs から ECR情報を取得
echo "📡 Fetching ECR repository URLs from Terragrunt..."
cd "infra/terraform/envs/${ENV}/ecr"

API_REPO_URL=$(terragrunt output -raw api_repository_url 2>/dev/null || echo "")
WEB_REPO_URL=$(terragrunt output -raw web_repository_url 2>/dev/null || echo "")
API_REPO_NAME=$(terragrunt output -raw api_repository_name 2>/dev/null || echo "")
WEB_REPO_NAME=$(terragrunt output -raw web_repository_name 2>/dev/null || echo "")

cd - > /dev/null

# プロジェクトルートに戻る（どこから実行されても動くように）
if [ -d "infra" ]; then
  PROJECT_ROOT="."
else
  PROJECT_ROOT="../.."
fi

# .env.staging ファイルを生成
cat > "${PROJECT_ROOT}/.env.${ENV}" << EOF
# ======================================
# AWS Configuration for ${ENV} environment
# Auto-generated at: $(date)
# ======================================

# AWS基本情報
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
AWS_REGION=${AWS_REGION}

# ECR リポジトリ情報
API_REPOSITORY_NAME=${API_REPO_NAME}
API_REPOSITORY_URL=${API_REPO_URL}
WEB_REPOSITORY_NAME=${WEB_REPO_NAME}
WEB_REPOSITORY_URL=${WEB_REPO_URL}

# ECRベースURL
ECR_BASE_URL=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# 環境名
ENVIRONMENT=${ENV}

# ======================================
# Application Configuration
# ======================================
# 以下は必要に応じて手動で追加してください

# データベース
# DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Redis
# REDIS_URL=redis://host:6379

# その他の環境変数
# API_KEY=your-api-key
EOF

echo ""
echo "✅ .env.${ENV} file created successfully at ${PROJECT_ROOT}/.env.${ENV}"
echo ""
echo "📄 Contents:"
cat "${PROJECT_ROOT}/.env.${ENV}"
