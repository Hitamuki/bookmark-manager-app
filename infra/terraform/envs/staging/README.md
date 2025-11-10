# Staging環境 Terragrunt構成

## 概要

Terragruntを使用した**超コスト最適化**されたstaging環境のインフラ構成です。

**月額コスト: $60-70**（営業時間のみ稼働）、最大65%のコスト削減を実現しています。

## 使用AWSサービス一覧

| カテゴリ               | サービス                      | 用途                      | 月額コスト（概算） |
| ---------------------- | ----------------------------- | ------------------------- | ------------------ |
| **コンピューティング** | ECS Fargate                   | コンテナ実行（Web + API） | $20-25             |
|                        | Lambda                        | ECS自動停止/起動          | $0.1未満           |
|                        | EventBridge                   | スケジューラー            | $0 (無料枠)        |
| **ネットワーク**       | VPC                           | ネットワーク基盤          | $0                 |
|                        | ALB                           | ロードバランサー          | $17.4              |
|                        | VPC Endpoint (Interface × 3)  | ECR/CloudWatch Logs       | $21.6              |
| **データベース**       | RDS PostgreSQL (db.t4g.micro) | メインDB                  | $15                |
| **ストレージ**         | S3                            | 静的アセット              | $1-5               |
|                        | ECR                           | コンテナイメージ          | $0-1               |
| **モニタリング**       | CloudWatch Logs               | ログ保存 (7日)            | $5-10              |
| **セキュリティ**       | IAM                           | アクセス制御              | $0                 |
|                        | Security Group                | ファイアウォール          | $0                 |
|                        | SSM Parameter Store           | シークレット管理          | $0 (無料枠)        |
| **合計**               |                               |                           | **$60-70/月**      |

## AWS構成概要

### アーキテクチャ構成図

```mermaid
graph TB
    User[ユーザー<br>固定IPのみ許可]

    subgraph AWS["AWS (ap-northeast-1)"]
        subgraph VPC["VPC (10.0.0.0/16)"]
            subgraph PublicSubnet["Public Subnet<br>(NAT Gateway削除でコスト削減)"]
                ALB[ALB<br>ロードバランサー<br>IP制限あり]
                ECS_Web[ECS Fargate<br>Next.js SSR<br>0.25 vCPU / 512 MB]
                ECS_API[ECS Fargate<br>NestJS API<br>0.25 vCPU / 512 MB]
            end

            subgraph PrivateSubnet["Private Subnet"]
                RDS[(RDS PostgreSQL<br>db.t4g.micro<br>Graviton2)]
                VPCE[VPC Endpoints<br>ECR/CloudWatch]
            end
        end

        Lambda[Lambda<br>ECS Scheduler<br>自動停止/起動]
        EB[EventBridge<br>cron: 月-金 9-22時]
        ECR[ECR<br>コンテナレジストリ]
        S3[S3<br>静的アセット]
        CW[CloudWatch Logs<br>7日保存]
        SSM[SSM Parameter Store<br>DB接続情報等]
    end

    User -->|HTTPS| ALB
    ALB --> ECS_Web
    ALB --> ECS_API
    ECS_Web --> RDS
    ECS_API --> RDS
    ECS_Web -.VPC Endpoint.- ECR
    ECS_API -.VPC Endpoint.- ECR
    ECS_Web -.VPC Endpoint.- CW
    ECS_API -.VPC Endpoint.- CW
    ECS_Web --> S3
    ECS_Web --> SSM
    ECS_API --> SSM

    EB -->|起動: 9:00 JST| Lambda
    EB -->|停止: 22:00 JST| Lambda
    Lambda -->|UpdateService| ECS_Web
    Lambda -->|UpdateService| ECS_API

    style RDS fill:#f9f,stroke:#333,stroke-width:2px
    style Lambda fill:#ff9,stroke:#333,stroke-width:2px
    style EB fill:#ff9,stroke:#333,stroke-width:2px
```

### Terragrunt依存関係図

```mermaid
graph TD
    Root[root.hcl<br>共通設定]
    Env[staging/env.hcl<br>環境設定]

    ECR[ecr<br>コンテナレジストリ]
    Network[network<br>VPC/サブネット<br>NAT削除]
    Security[security<br>IAM/SG<br>IP制限]
    Database[database<br>RDS PostgreSQL<br>db.t4g.micro]
    Compute[compute<br>ECS/ALB<br>自動停止/起動]
    Storage[storage<br>S3バケット]

    Root --> Env
    Env --> ECR
    Env --> Network
    Network --> Security
    Security --> Database
    Security --> Compute
    ECR --> Compute
    Network --> Compute
    Network --> Database

    style Compute fill:#ff9,stroke:#333,stroke-width:3px
    style Database fill:#f9f,stroke:#333,stroke-width:3px
    style Network fill:#9ff,stroke:#333,stroke-width:3px
```

### ネットワーク構成

```
Internet (固定IPのみ)
    ↓
┌─────────────────────────────────────────────┐
│ Public Subnet (NAT Gateway削除)             │
│   - ALB (IP制限あり)                        │
│   - ECS Fargate (Web + API)                 │
│     ※パブリックIP割り当て                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ Private Subnet                              │
│   - RDS PostgreSQL (db.t4g.micro)           │
│   - VPC Endpoints:                          │
│     • ECR API (Interface)                   │
│     • ECR DKR (Interface)                   │
│     • S3 (Gateway - 無料)                   │
│     • CloudWatch Logs (Interface)           │
└─────────────────────────────────────────────┘
```

## コスト最適化施策

### 実装済みの最適化

#### 1. ECS自動停止/起動 ⭐ 重要

- **削減効果**: ECS稼働時間 65%削減
- **実装**:
  - EventBridge + Lambda によるスケジューラー
  - 月〜金 9:00-22:00 JST のみ稼働
  - 土日・営業時間外は自動停止（desired_count = 0）
- **設定**: [compute/auto_schedule.tf](../../modules/compute/auto_schedule.tf)

#### 2. RDS PostgreSQL採用 ⭐ 重要

- **削減効果**: 月額 $28削減（65%削減）
- **変更**: Aurora Serverless v2 → RDS PostgreSQL (db.t4g.micro)
- **メリット**: Graviton2プロセッサでコスト最適化
- **設定**: [database/rds.tf](../../modules/database/rds.tf)

#### 3. NAT Gateway削除 ⭐ 重要

- **削減効果**: 月額 $32削減
- **変更**: ECSタスクをパブリックサブネットに配置
- **セキュリティ**: ALBで固定IP制限 ([terraform.tfvars.example](terraform.tfvars.example))
- **設定**: [network/terragrunt.hcl](network/terragrunt.hcl) で `enable_nat_gateway = false`

#### 4. VPC Endpoint使用

- **削減効果**: NAT Gatewayデータ転送料 月額$400-500削減
- **実装**: ECR、S3、CloudWatch LogsへのプライベートアクセスVPC Endpoint使用
- **実績**: 15時間で279GB転送 → $17.32のデータ転送料が発生（VPC Endpoint導入前）

#### 5. その他の最適化

- **ECS Fargate**: CPU 256 (0.25 vCPU) / Memory 512 MB / 各1タスク
- **S3**: バージョニング無効、ライフサイクルルール適用
- **CloudWatch Logs**: 7日間保存
- **ECS Container Insights**: 無効化
- **WAF**: 無効化（必要に応じて有効化）
- **削除保護**: 無効化

### 推奨事項

- **使わない時は必ずリソース削除**: `terragrunt run-all destroy`
- **開発中は必要最小限のリソースのみ稼働**
- **固定IP設定**: [terraform.tfvars.example](terraform.tfvars.example) を参照してIP制限を設定

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
- **一括操作**: `terragrunt run --all` で全モジュールを一括適用可能

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
1. 固定IP設定（terraform.tfvars作成）
   ↓
2. Lambda関数のビルド（TypeScript → JavaScript）
   ↓
3. インフラ構築（terragrunt run --all apply）
   - ECRリポジトリ作成
   - network → security → compute → database → storage
   ↓
4. Prismaマイグレーション実行
   - .env.stagingにDATABASE_URLを設定
   - pnpm prisma migrate deploy
   ↓
5. コンテナイメージのビルド＆プッシュ
   ↓
6. ECS再デプロイ
```

## 初期セットアップ

### 1. Terragruntのインストール

```bash
mise install
```

### 2. 固定IP設定（セキュリティ強化）

ALBへのアクセスを特定のIPアドレスのみに制限します。

```bash
cd infra/terraform/envs/staging

# サンプルファイルをコピー
cp terraform.tfvars.example terraform.tfvars

# 自分のIPアドレスを確認
curl -s https://checkip.amazonaws.com

# terraform.tfvarsを編集して固定IPを設定
# 例:
# allowed_cidr_blocks = [
#   "203.0.113.10/32",  # オフィスIP
#   "198.51.100.20/32", # 自宅IP
# ]
```

**注意**:
- `terraform.tfvars`は`.gitignore`に含まれており、Gitにコミットされません
- `/32`は単一IPアドレスを指定します
- 複数のIPを許可する場合は、配列にIPを追加してください

### 3. Lambda関数のビルド（ECS自動停止/起動）

Lambda関数はTypeScriptで記述されていますが、AWS Lambdaは直接TypeScriptを実行できないため、JavaScriptにトランスパイルする必要があります。

#### esbuildでビルド

```bash
cd infra/terraform/modules/compute/lambda

# esbuildでTypeScriptをバンドル
npx esbuild ecs_scheduler.ts \
  --bundle \
  --platform=node \
  --target=node20 \
  --outfile=ecs_scheduler.js

# ビルド成功を確認
ls -lh ecs_scheduler.js
```

### 3. インフラ構築

```bash
cd infra/terraform/envs/staging

# 全モジュールを初期化
terragrunt run --all init

# 実行計画の確認
terragrunt run --all plan

# 全モジュールを一括構築（依存関係順に自動実行）
terragrunt run --all apply
```

### 4. Prismaマイグレーションの実行

データベースが構築されたら、Prismaマイグレーションを実行してテーブルを作成します。

**重要**: RDSはプライベートサブネットにあるため、ローカルから直接アクセスできません。SSMポートフォワーディング経由で接続する必要があります。

#### ステップ1: 環境変数ファイルの準備

```bash
# プロジェクトルートで実行

# SSM Parameter StoreからDATABASE_URLを取得して設定
# localhost経由でアクセスするため、エンドポイントをlocalhostに変更
aws ssm get-parameter \
  --name "/bookmark-manager/staging/DATABASE_URL" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text

# 取得したURLのホスト部分をlocalhostに置き換えて.env.stagingに設定
# 例: postgresql://dbadmin:PASSWORD@localhost:5432/bookmarkdb
```

`.env.staging`の例：
```
DATABASE_URL="postgresql://dbadmin:YOUR_PASSWORD@localhost:5432/bookmarkdb"
```

#### ステップ2: SSMポートフォワーディングの開始

別ターミナルで、ECS経由でRDSへのポートフォワーディングを確立します。

```bash
# 別ターミナルで実行
./scripts/connect_to_aurora.sh staging 5432

# 以下の情報が表示されます:
# - ホスト: localhost
# - ポート: 5432
# - データベース: bookmarkdb
# - ユーザー名: dbadmin
# - パスワード: (表示されます)
```

**トラブルシューティング**:
- ECSタスクが実行中でない場合、先にECSサービスを起動してください
- `enableExecuteCommand`が無効の場合、Terraformで有効化が必要です

#### ステップ3: マイグレーションの実行

ポートフォワーディングが確立したら、元のターミナルでマイグレーションを実行します。

```bash
# .env.stagingを使用してマイグレーション実行
pnpm dotenv -e .env.staging -- prisma migrate deploy \
  --schema=src/libs/prisma/schema.prisma

# シードデータの投入（必要に応じて）
pnpm dotenv -e .env.staging -- prisma db seed
```

**注意**:
- `migrate deploy`は本番環境用のマイグレーションコマンドで、プロンプトなしで実行されます
- ローカル開発では`migrate dev`を使用しますが、staging/production環境では`migrate deploy`を使用します
- ポートフォワーディングが確立している間のみマイグレーションが可能です

#### ステップ4: マイグレーション確認

```bash
# Prisma Studioでテーブルを確認
pnpm dotenv -e .env.staging -- prisma studio

# または、psqlコマンドで確認（ポートフォワーディング確立中）
psql "postgresql://dbadmin:<PASSWORD>@localhost:5432/bookmarkdb"

# テーブル一覧を表示
\dt

# 接続を終了
\q
```

#### ステップ5: ポートフォワーディングの終了

マイグレーションが完了したら、ポートフォワーディングを終了します。

```bash
# ポートフォワーディングを実行しているターミナルで Ctrl+C を押す
```

### 5. コンテナイメージのビルド＆プッシュ

プロジェクトルートに戻り、コンテナイメージをビルドしてECRにプッシュ

```bash
# プロジェクトルートに戻る
# 以降はfishシェル用
# AWSアカウントIDを取得
set AWS_ACCOUNT_ID (aws sts get-caller-identity --query Account --output text)
set AWS_REGION (aws configure get region)

# ECRログイン
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Webイメージのビルド＆プッシュ
docker build --platform linux/amd64 -t bookmark-manager-staging-web:latest -f src/apps/frontend/web/Dockerfile .
docker tag bookmark-manager-staging-web:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookmark-manager-staging-web:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookmark-manager-staging-web:latest

# APIイメージのビルド＆プッシュ
docker build --platform linux/amd64 -t bookmark-manager-staging-api:latest -f src/apps/web-api/core/Dockerfile .
docker tag bookmark-manager-staging-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookmark-manager-staging-api:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookmark-manager-staging-api:latest
```

### 6. ECS再デプロイ

```bash
aws ecs update-service --cluster bookmark-manager-staging-cluster --service bookmark-manager-staging-api --force-new-deployment --query 'service.{ServiceName:serviceName,Status:status,DesiredCount:desiredCount}'
aws ecs update-service --cluster bookmark-manager-staging-cluster --service bookmark-manager-staging-web --force-new-deployment --query 'service.{ServiceName:serviceName,Status:status,DesiredCount:desiredCount}'
```

## 構築後の設定

### データベース接続情報の取得

```bash
# データベースエンドポイント
cd database
terragrunt run output db_cluster_endpoint

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
# aws ssm put-parameter \
#   --name "/bookmark-manager/staging/JWT_SECRET" \
#   --value "your-secret-key" \
#   --type "SecureString"

# MongoDB接続文字列（別途MongoDB Atlas設定が必要）
aws ssm put-parameter \
  --name "/bookmark-manager/staging/MONGODB_URI" \
  --value "mongodb+srv://..." \
  --type "SecureString"
```

### ALBのDNS名を確認

```bash
cd compute
terragrunt run output alb_dns_name
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
docker build --platform linux/amd64 -t bookmark-manager-staging-web:v1.0.1 \
  -f src/apps/frontend/web/Dockerfile .
docker tag bookmark-manager-staging-web:v1.0.1 \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:v1.0.1
docker tag bookmark-manager-staging-web:v1.0.1 \
  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:v1.0.1
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/bookmark-manager-staging-web:latest

# APIイメージの更新（バージョンタグ付き）
docker build --platform linux/amd64 -t bookmark-manager-staging-api:v1.0.1 \
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
terragrunt run apply
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
terragrunt run --all destroy
```

## 想定月額コスト

### コスト比較

| 運用パターン               | 月額コスト | 削減率  | 備考                                |
| -------------------------- | ---------- | ------- | ----------------------------------- |
| **24時間稼働（最適化前）** | $145-170   | -       | 旧構成（Aurora + NAT Gateway）      |
| **24時間稼働（最適化後）** | $80-90     | 45%     | RDS + NAT削除 + IP制限              |
| **営業時間のみ（推奨）**   | **$60-70** | **65%** | **月〜金 9-22時 + 自動停止/起動** ⭐ |

### 詳細内訳（営業時間のみ稼働の場合）

| リソース                          | 料金体系                                       | 月額コスト（概算） | 備考                              |
| --------------------------------- | ---------------------------------------------- | ------------------ | --------------------------------- |
| **RDS PostgreSQL (db.t4g.micro)** | $0.016/時間                                    | **$11.5**          | 24時間稼働、Graviton2             |
| **ECS Fargate (Web)**             | vCPU: $0.04656/時間<br>Memory: $0.00511/GB時間 | **$7.5**           | 0.25 vCPU + 0.5 GB、営業時間のみ  |
| **ECS Fargate (API)**             | vCPU: $0.04656/時間<br>Memory: $0.00511/GB時間 | **$7.5**           | 0.25 vCPU + 0.5 GB、営業時間のみ  |
| **ALB**                           | $0.0243/時間 + LCU料金                         | **$17.4**          | 時間料金 + 使用量課金             |
| **VPC Endpoint (Interface × 3)**  | $0.01/時間 × 3                                 | **$21.6**          | ECR API, ECR DKR, CloudWatch Logs |
| **Lambda (ECS Scheduler)**        | リクエスト + 実行時間                          | **$0.05未満**      | 1日2回実行                        |
| **S3**                            | ストレージ + リクエスト                        | **$1-5**           | データ量による                    |
| **CloudWatch Logs**               | 取り込み + 保存                                | **$5-10**          | ログ量による、7日保存             |
| **その他**                        | データ転送、ECR等                              | **$1-5**           | -                                 |

**合計: 約$60-70/月**（営業時間のみ稼働）

### コスト削減の内訳

| 削減施策                 | 削減効果                      | 実装状況    |
| ------------------------ | ----------------------------- | ----------- |
| ECS自動停止/起動         | ECS稼働時間 65%削減           | ✅ 実装済み  |
| Aurora → RDS             | 月額 $28削減（65%削減）       | ✅ 実装済み  |
| NAT Gateway削除          | 月額 $32削減                  | ✅ 実装済み  |
| VPC Endpoint使用         | データ転送料 月額$400-500削減 | ✅ 実装済み  |
| Container Insights無効化 | 月額 $10削減                  | ✅ 実装済み  |
| CloudWatch Logs 7日保存  | 月額 $5-10削減                | ✅ 実装済み  |
| **合計削減効果**         | **月額 $75-145削減**          | **65%削減** |

### 使わない時はリソース削除

**削減効果: 100%（$0/月）**

```bash
# 作業終了時
cd infra/terraform/envs/staging
terragrunt run-all destroy

# 必要な時だけ
terragrunt run-all apply
```

## コスト監視

### データ転送量の監視

NAT Gatewayのデータ転送量を監視し、異常な増加を検知：

```bash
# CloudWatch Alarms設定例（1日10GB以上でアラート）
aws cloudwatch put-metric-alarm \
  --alarm-name staging-nat-high-traffic \
  --metric-name BytesOutToSource \
  --namespace AWS/NATGateway \
  --statistic Sum \
  --period 86400 \
  --threshold 10737418240 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### コスト確認コマンド

```bash
# 今月のコストを確認
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d "1 day ago" +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output table

# NAT Gatewayのデータ転送量を確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/NATGateway \
  --metric-name BytesOutToSource \
  --dimensions Name=NatGatewayId,Value=<NAT_GATEWAY_ID> \
  --start-time $(date -u -d "1 day ago" +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

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
terragrunt run init -migrate-state

cd ../security
terragrunt run init -migrate-state

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

### Lambda関数のデプロイエラー

**症状**: `terragrunt apply`実行時に以下のエラーが発生

```
Error: error creating Lambda Function: InvalidParameterValueException:
Uploaded file must be a non-empty zip
```

**原因**: TypeScriptファイル(.ts)をそのままzipにしようとしている

**対策**:

1. **Lambda関数をJavaScriptにビルド**:

   ```bash
   cd infra/terraform/modules/compute/lambda

   # esbuildでビルド
   npx esbuild ecs_scheduler.ts \
     --bundle \
     --platform=node \
     --target=node20 \
     --outfile=ecs_scheduler.js

   # 成功を確認
   ls -lh ecs_scheduler.js
   ```

2. **Terraformを再実行**:

   ```bash
   cd infra/terraform/envs/staging/compute
   terragrunt run apply
   ```

### Lambda関数のテスト

ECS自動停止/起動が正しく動作するか確認:

```bash
# Lambda関数を手動実行（停止テスト）
aws lambda invoke \
  --function-name bookmark-manager-staging-ecs-scheduler \
  --payload '{"action":"stop"}' \
  --cli-binary-format raw-in-base64-out \
  response.json

# 結果を確認
cat response.json

# Lambda関数を手動実行（起動テスト）
aws lambda invoke \
  --function-name bookmark-manager-staging-ecs-scheduler \
  --payload '{"action":"start"}' \
  --cli-binary-format raw-in-base64-out \
  response.json

# ECSタスク数を確認
aws ecs describe-services \
  --cluster bookmark-manager-staging-cluster \
  --services bookmark-manager-staging-web bookmark-manager-staging-api \
  --query 'services[*].[serviceName,desiredCount,runningCount]' \
  --output table

# Lambda関数のログを確認
aws logs tail /aws/lambda/bookmark-manager-staging-ecs-scheduler --follow
```

### ECSタスクが再起動を繰り返す場合（重要）

**症状**: Dockerイメージの繰り返しpullによりNAT Gatewayデータ転送料が高騰

**原因**:
1. ヘルスチェック失敗による再起動ループ
2. アプリケーションの起動時間がヘルスチェック猶予期間より長い
3. メモリ不足によるOOMKill

**対策** (実装済み):

1. **ヘルスチェック猶予期間の設定**
   ```hcl
   health_check_grace_period_seconds = 120
   ```
   アプリケーション起動後120秒間はヘルスチェック失敗を無視

2. **unhealthy_thresholdの増加**
   ```hcl
   unhealthy_threshold = 10  # デフォルト: 2-3
   ```
   10回連続で失敗するまでタスクを再起動しない

3. **ヘルスチェック間隔の延長**
   ```hcl
   interval = 60  # 60秒ごとにチェック（デフォルト: 30秒）
   ```

4. **デプロイサーキットブレーカー**
   ```hcl
   deployment_circuit_breaker {
     enable   = true
     rollback = true
   }
   ```
   失敗したデプロイを自動ロールバック

**確認コマンド**:

```bash
# ECSタスクの停止理由を確認
aws ecs describe-tasks \
  --cluster bookmark-manager-staging-cluster \
  --tasks $(aws ecs list-tasks \
    --cluster bookmark-manager-staging-cluster \
    --service-name bookmark-manager-staging-api-service \
    --query 'taskArns[0]' --output text) \
  --query 'tasks[0].stoppedReason'

# CloudWatch Logsで起動ログを確認
aws logs tail /ecs/bookmark-manager-staging-api --follow

# タスクのイベント履歴を確認
aws ecs describe-services \
  --cluster bookmark-manager-staging-cluster \
  --services bookmark-manager-staging-api-service \
  --query 'services[0].events[0:10]'
```

**アプリケーション側の対策**:

1. `/health` エンドポイントを軽量にする
2. 起動時の重い処理を遅延実行
3. グレースフルシャットダウンの実装

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
5. メモリ/CPUリソースが十分か確認

### データベースに接続できない場合

1. セキュリティグループの設定を確認
2. DATABASE_URLが正しいか確認
3. Aurora Serverless v2がスケールアップしているか確認

### Terragruntキャッシュの問題

```bash
# 全キャッシュをクリア
cd infra/terraform/envs/staging
terragrunt run --all init -reconfigure
```

## よくある質問

### Q: Terraformとの違いは？

A: Terragruntは、Terraformのラッパーツールです。Terraformの機能をすべて使用できますが、以下の追加機能があります：

- 設定の再利用（DRY原則）
- モジュール間の依存関係管理
- バックエンド設定の自動生成
- 一括操作（run --all）

### Q: 既存のTerraform設定から移行するには？

A: 以下の手順で移行できます：

1. Terragruntの `terraform.source` を既存モジュールパスに設定
2. `inputs` ブロックで変数を定義
3. `terragrunt run init` で初期化
4. 既存のstateファイルを移行（必要に応じて）

### Q: CI/CDとの統合は？

A: GitHub Actionsなどで以下のようなワークフローを作成します：

```yaml
- name: Terragrunt Plan
  run: |
    cd infra/terraform/envs/staging
    terragrunt run --all plan

- name: Terragrunt Apply
  run: |
    cd infra/terraform/envs/staging
    terragrunt run --all apply -auto-approve
```

## 参考資料

- [Terragrunt公式ドキュメント](https://terragrunt.gruntwork.io/docs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Aurora Serverless v2](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)
- [ECS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)
