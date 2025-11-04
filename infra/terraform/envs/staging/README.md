# Staging環境 Terragrunt構成

## 概要

Terragruntを使用したコスト最適化されたstaging環境のインフラ構成です。

## コスト最適化のポイント

- **ECS Fargate**: CPU 256 (0.25 vCPU) / Memory 512 MB / 各1タスク
- **Aurora Serverless v2**: 最小0.5 ACU、最大1.0 ACU、シングルインスタンス
- **NAT Gateway**: 単一NAT Gateway（マルチAZ構成ではない）
- **S3**: バージョニング無効、ライフサイクルルール適用
- **CloudWatch Logs**: 7日間保存
- **ECS Container Insights**: 無効化
- **WAF**: 無効化（必要に応じて有効化）
- **削除保護**: 無効化

## 前提条件

- AWS CLIがインストール・設定済み
- Terraform 1.9以上がインストール済み
- **Terragrunt 0.68以上がインストール済み**
- ECRにコンテナイメージがプッシュ済み（必要に応じて）

## Terragruntとは

Terragruntは、Terraformのラッパーツールで、以下のメリットがあります：

- **DRY（Don't Repeat Yourself）**: 共通設定を一元管理し、重複を削減
- **依存関係管理**: モジュール間の依存関係を自動的に解決
- **バックエンド設定の一元化**: 環境ごとにバックエンド設定を複製する必要がない
- **一括操作**: `terragrunt run-all` で全モジュールを一括適用可能

## ディレクトリ構成

``` txt
infra/terraform/envs/staging/
├── terragrunt.hcl          # staging環境共通設定
├── README.md               # このファイル
├── ecr/
│   └── terragrunt.hcl     # ECRリポジトリ
├── network/
│   └── terragrunt.hcl     # VPC、サブネット、ルーティング
├── security/
│   └── terragrunt.hcl     # セキュリティグループ、IAM
├── compute/
│   └── terragrunt.hcl     # ECS、ALB、タスク定義
├── database/
│   └── terragrunt.hcl     # Aurora、SSM Parameter Store
└── storage/
    └── terragrunt.hcl     # S3バケット
```

## デプロイフロー

以下の順序でインフラを構築します：

```
1. ECRリポジトリ作成
   ↓
2. コンテナイメージのビルド＆プッシュ
   ↓
3. 残りのインフラ構築（network → security → compute → database → storage）
```

## 初期セットアップ

### 1. Terragruntのインストール

```bash
mise install
```

### 2. ECRリポジトリの作成

まず、コンテナイメージを保存するECRリポジトリを作成します。

```bash
cd infra/terraform/envs/staging/ecr

# 初期化
terragrunt init

# ECRリポジトリのみ先にデプロイ
terragrunt apply
```

### 3. コンテナイメージのビルド＆プッシュ

プロジェクトルートに戻り、コンテナイメージをビルドしてECRにプッシュします。

```bash
# プロジェクトルートに戻る
cd ../../../../

# AWSアカウントIDを取得
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="ap-northeast-1"

# ECRログイン
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Webイメージのビルド＆プッシュ
docker build -t bookmark-manager-staging-web:latest \
  -f src/apps/frontend/web/Dockerfile .
docker tag bookmark-manager-staging-web:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:latest

# APIイメージのビルド＆プッシュ
docker build -t bookmark-manager-staging-api:latest \
  -f src/apps/web-api/core/Dockerfile .
docker tag bookmark-manager-staging-api:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-api:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-api:latest
```

### 4. 残りのインフラ構築

```bash
cd infra/terraform/envs/staging

# 全モジュールを初期化
terragrunt run-all init

# 実行計画の確認
terragrunt run-all plan

# 全モジュールを一括構築（依存関係順に自動実行）
terragrunt run-all apply
```

または、モジュール単位で構築する場合：

```bash
cd network
terragrunt apply

cd ../security
terragrunt apply

cd ../compute
terragrunt apply

cd ../database
terragrunt apply

cd ../storage
terragrunt apply
```

## 構築後の設定

### データベース接続情報の取得

```bash
# データベースエンドポイント
cd database
terragrunt output db_cluster_endpoint

# DATABASE_URL（Prisma用）
aws ssm get-parameter \
  --name "/bookmark-manager/staging/DATABASE_URL" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text
```

### 環境変数の設定

SSM Parameter Storeに環境変数を設定：

```bash
# JWT_SECRET
aws ssm put-parameter \
  --name "/bookmark-manager/staging/JWT_SECRET" \
  --value "your-secret-key" \
  --type "SecureString"

# MongoDB接続文字列（別途MongoDB Atlas設定が必要）
aws ssm put-parameter \
  --name "/bookmark-manager/staging/MONGODB_URI" \
  --value "mongodb+srv://..." \
  --type "SecureString"
```

### ALBのDNS名を確認

```bash
cd compute
terragrunt output alb_dns_name
```

ブラウザでアクセスして動作確認してください。

## デプロイ

### コンテナイメージの更新

新しいコンテナイメージをデプロイする場合：

#### 方法1: 新しいイメージをビルド＆プッシュして自動デプロイ

```bash
# プロジェクトルートで実行
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="ap-northeast-1"

# ECRログイン
aws ecr get-login-password --region ${AWS_REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Webイメージの更新（バージョンタグ付き）
docker build -t bookmark-manager-staging-web:v1.0.1 \
  -f src/apps/frontend/web/Dockerfile .
docker tag bookmark-manager-staging-web:v1.0.1 \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:v1.0.1
docker tag bookmark-manager-staging-web:v1.0.1 \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:v1.0.1
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:latest

# APIイメージの更新（バージョンタグ付き）
docker build -t bookmark-manager-staging-api:v1.0.1 \
  -f src/apps/web-api/core/Dockerfile .
docker tag bookmark-manager-staging-api:v1.0.1 \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-api:v1.0.1
docker tag bookmark-manager-staging-api:v1.0.1 \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-api:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-api:v1.0.1
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-api:latest

# ECSサービスを強制的に再デプロイ（latestタグを使用している場合）
aws ecs update-service \
  --cluster bookmark-manager-staging-cluster \
  --service bookmark-manager-staging-web \
  --force-new-deployment

aws ecs update-service \
  --cluster bookmark-manager-staging-cluster \
  --service bookmark-manager-staging-api \
  --force-new-deployment
```

#### 方法2: Terragruntでイメージタグを指定してデプロイ

```bash
# compute/terragrunt.hclのイメージタグを更新
# 例: web_image = "${dependency.ecr.outputs.web_repository_url}:v1.0.1"

cd infra/terraform/envs/staging/compute
terragrunt apply
```

## メンテナンス

### ログの確認

```bash
# Webサービスのログ
aws logs tail /ecs/bookmark-manager-staging-web --follow

# APIサービスのログ
aws logs tail /ecs/bookmark-manager-staging-api --follow
```

### ECSタスクの確認

```bash
aws ecs list-tasks --cluster bookmark-manager-staging-cluster
aws ecs describe-tasks \
  --cluster bookmark-manager-staging-cluster \
  --tasks <task-arn>
```

### Terragruntキャッシュのクリア

```bash
# 全モジュールのキャッシュをクリア
cd infra/terraform/envs/staging
find . -type d -name ".terragrunt-cache" -exec rm -rf {} +
```

## インフラ削除

**注意**: データベースを含む全てのリソースが削除されます。

```bash
cd infra/terraform/envs/staging

# 全モジュールを一括削除（依存関係の逆順に自動実行）
terragrunt run-all destroy
```

## 想定月額コスト（概算）

- **ECS Fargate**: 約$15-20（2タスク、24時間稼働）
- **Aurora Serverless v2**: 約$50-80（0.5-1.0 ACU、シングルインスタンス）
- **NAT Gateway**: 約$35-40
- **ALB**: 約$20-25
- **S3**: 約$1-5（データ量による）
- **その他（CloudWatch、データ転送など）**: 約$10-20

**合計**: 約$130-190/月

## State管理（ローカル vs S3バックエンド）

### 現在の設定（ローカルstate）

現在は学習・開発目的でローカルstateを使用しています。各モジュールのstateファイルは以下に保存されます：

``` txt
infra/terraform/envs/staging/
├── network/terraform.tfstate
├── security/terraform.tfstate
├── compute/terraform.tfstate
├── database/terraform.tfstate
└── storage/terraform.tfstate
```

**メリット**:
- セットアップが簡単
- AWSリソースの追加コスト不要
- 学習・実験に最適

**デメリット**:
- チーム開発に不向き
- CI/CDとの統合が困難
- バックアップ管理が必要

### S3バックエンドへの移行（本番推奨）

チーム開発やCI/CD導入時には、S3バックエンドへの移行を推奨します。

#### ステップ1: S3バケット・DynamoDBテーブルの作成

```bash
# S3バケット作成（stateファイル保存用）
aws s3api create-bucket \
  --bucket bookmark-manager-terraform-state \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

# バージョニング有効化
aws s3api put-bucket-versioning \
  --bucket bookmark-manager-terraform-state \
  --versioning-configuration Status=Enabled

# 暗号化有効化
aws s3api put-bucket-encryption \
  --bucket bookmark-manager-terraform-state \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# DynamoDBテーブル作成（state lock用）
aws dynamodb create-table \
  --table-name bookmark-manager-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1
```

#### ステップ2: ルートroot.hclの修正

[infra/terraform/envs/root.hcl](../root.hcl) の `remote_state` ブロックを以下のように修正：

```hcl
remote_state {
  backend = "s3"

  config = {
    bucket         = "bookmark-manager-terraform-state"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "bookmark-manager-terraform-locks"
  }

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}
```

#### ステップ3: 既存stateの移行

```bash
cd infra/terraform/envs/staging

# 各モジュールで既存stateをS3へ移行
cd network
terragrunt init -migrate-state

cd ../security
terragrunt init -migrate-state

# ...他のモジュールも同様に実行
```

#### ステップ4: ローカルstateファイルの削除

移行が成功したら、ローカルのstateファイルを削除：

```bash
cd infra/terraform/envs/staging
find . -name "terraform.tfstate*" -type f -delete
```

## MongoDB Atlas設定

MongoDB Atlasは別途設定が必要です：

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)でアカウント作成
2. Freeクラスター（M0）を作成
3. データベースユーザーを作成
4. ネットワークアクセス設定でVPC CIDRを許可
5. 接続文字列を取得してSSM Parameter Storeに保存

## トラブルシューティング

### Terragruntが依存関係を解決できない場合

```bash
# 依存関係グラフを表示
terragrunt graph-dependencies | dot -Tpng > dependencies.png
```

### ECSタスクが起動しない場合

1. タスク定義を確認
2. CloudWatch Logsでエラーを確認
3. セキュリティグループの設定を確認
4. コンテナイメージが正しいか確認

### データベースに接続できない場合

1. セキュリティグループの設定を確認
2. DATABASE_URLが正しいか確認
3. Aurora Serverless v2がスケールアップしているか確認

### Terragruntキャッシュの問題

```bash
# 全キャッシュをクリア
cd infra/terraform/envs/staging
terragrunt run-all init -reconfigure
```

## よくある質問

### Q: Terraformとの違いは？

A: Terragruntは、Terraformのラッパーツールです。Terraformの機能をすべて使用できますが、以下の追加機能があります：

- 設定の再利用（DRY原則）
- モジュール間の依存関係管理
- バックエンド設定の自動生成
- 一括操作（run-all）

### Q: 既存のTerraform設定から移行するには？

A: 以下の手順で移行できます：

1. Terragruntの `terraform.source` を既存モジュールパスに設定
2. `inputs` ブロックで変数を定義
3. `terragrunt init` で初期化
4. 既存のstateファイルを移行（必要に応じて）

### Q: CI/CDとの統合は？

A: GitHub Actionsなどで以下のようなワークフローを作成します：

```yaml
- name: Terragrunt Plan
  run: |
    cd infra/terraform/envs/staging
    terragrunt run-all plan

- name: Terragrunt Apply
  run: |
    cd infra/terraform/envs/staging
    terragrunt run-all apply -auto-approve
```

## 参考資料

- [Terragrunt公式ドキュメント](https://terragrunt.gruntwork.io/docs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Aurora Serverless v2](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)
- [ECS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
