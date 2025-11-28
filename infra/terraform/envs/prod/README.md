# 本番環境 (Production)

## 概要

一般公開のアプリケーション（同時100ユーザー想定）の本番環境です。

### 主要な特徴

- **サービス形態**: 一般公開サービス（IP制限なし）
- **想定トラフィック**: 同時100ユーザー（最大500-1000ユーザーまで拡張可能）
- **初期構成**: バランス重視（ECS 1タスク、Aurora Multi-AZ）
- **Auto Scaling**: 負荷に応じて自動スケールイン/アウト（1-10タスク）
- **セキュリティ**: プライベートサブネット配置、HTTPS、WAF有効
- **コスト**: 平常時 約$190.50/月、ピーク時 約$620.50/月

## アーキテクチャ構成図

### システム全体構成

```mermaid
graph TB
    subgraph "Internet"
        Users[ユーザー<br>100同時接続]
    end

    subgraph "DNS"
        Route53[Route53<br>tidilyspace.com]
    end

    subgraph "AWS Cloud - Region: ap-northeast-1"
        subgraph "Certificate"
            ACM[ACM証明書<br>*.tidilyspace.com<br>TLS 1.3]
        end

        subgraph "VPC: 10.1.0.0/16"
            subgraph "Public Subnet (AZ-a/c)"
                ALB[Application Load Balancer<br>WAF有効<br>HTTPS対応]
                NAT[NAT Gateway<br>Single-AZ]
                Bastion[Bastion Host<br>t3.nano]
            end

            subgraph "Private Subnet (AZ-a/c)"
                subgraph "ECS Cluster"
                    Web[Web Task<br>Next.js<br>1vCPU/2GB<br>Auto Scale: 1-10<br>Scale-in: 5min cooldown]
                    API[API Task<br>NestJS<br>1vCPU/2GB<br>Auto Scale: 1-10<br>Scale-in: 5min cooldown]
                end

                subgraph "Aurora Cluster - Multi-AZ"
                    Writer[Writer Instance<br>PostgreSQL 17.6<br>Serverless v2<br>0.5-2 ACU]
                    Reader[Reader Instance<br>PostgreSQL 17.6<br>Serverless v2<br>0.5-2 ACU]
                end
            end

            VPCEndpoint[VPC Endpoint<br>ECR/S3]
        end

        subgraph "S3"
            S3Bucket[Staticアセット<br>バージョニング有効]
        end

        subgraph "ECR"
            WebImage[Web Image]
            APIImage[API Image]
        end

        subgraph "Monitoring"
            CW[CloudWatch Logs<br>30日保持]
            Datadog[Datadog<br>メトリクス監視]
            Sentry[Sentry<br>エラー監視]
        end

        subgraph "Auto Scaling"
            ECSAS[ECS Auto Scaling<br>1-10 tasks<br>CPU 70%/Memory 80%]
            AuroraAS[Aurora Auto Scaling<br>0.5-2 ACU]
        end
    end

    Users -->|DNS Query| Route53
    Route53 -->|A Record| ALB
    ACM -.->|SSL/TLS証明書| ALB
    Users -->|HTTPS| ALB
    ALB -->|/| Web
    ALB -->|/api/*| API

    Web -->|Write/Read| Writer
    API -->|Write/Read| Writer
    Web -.->|Read-only| Reader
    API -.->|Read-only| Reader

    Writer -.->|自動昇格<br>1-2分| Reader

    Web -->|インターネット接続| NAT
    API -->|インターネット接続| NAT

    Web -->|プライベート接続| VPCEndpoint
    API -->|プライベート接続| VPCEndpoint

    VPCEndpoint -->|イメージ取得| ECR
    VPCEndpoint -->|静的ファイル| S3Bucket

    Web -.->|ログ/メトリクス| CW
    API -.->|ログ/メトリクス| CW
    Web -.->|エラー追跡| Sentry
    API -.->|エラー追跡| Sentry

    ECSAS -.->|スケールイン/アウト| Web
    ECSAS -.->|スケールイン/アウト| API

    AuroraAS -.->|スケーリング制御| Writer
    AuroraAS -.->|スケーリング制御| Reader

    Bastion -.->|メンテナンス接続| Writer

    style Route53 fill:#f39c12
    style ACM fill:#9b59b6
    style ALB fill:#ff6b6b
    style Web fill:#4ecdc4
    style API fill:#45b7d1
    style Writer fill:#f9ca24
    style Reader fill:#f0932b
    style NAT fill:#95afc0
    style Datadog fill:#a29bfe
    style Sentry fill:#fd79a8
```

## AWSサービス一覧

| カテゴリ               | サービス                      | 用途                                | スペック                                                  | 月額コスト概算 | 選定理由                                            |
| ---------------------- | ----------------------------- | ----------------------------------- | --------------------------------------------------------- | -------------- | --------------------------------------------------- |
| **コンピューティング** | ECS Fargate                   | コンテナ実行基盤                    | Web: 1-10タスク (1vCPU/2GB) / API: 1-10タスク (1vCPU/2GB) | $44-440        | サーバーレス、自動スケーリング対応、運用負荷低      |
|                        | ECS Auto Scaling              | 自動スケーリング                    | CPU 70％/Memory 80％閾値                                  | 無料           | 負荷に応じた自動スケーリングでコスト最適化          |
| **ネットワーク**       | VPC                           | 仮想ネットワーク                    | 10.1.0.0/16                                               | 無料           | ネットワーク分離、セキュリティ強化                  |
|                        | Application Load Balancer     | L7ロードバランサー                  | HTTPS対応                                                 | $23            | パスベースルーティング、ヘルスチェック、SSL/TLS終端 |
|                        | NAT Gateway                   | インターネット接続                  | Single-AZ                                                 | $32            | プライベートサブネットからの外部接続                |
|                        | VPC Endpoint                  | AWSサービス接続                     | ECR/S3                                                    | $15            | データ転送料削減、セキュリティ強化                  |
|                        | Route53                       | DNSサービス                         | ホストゾーン1個                                           | $0.50          | カスタムドメイン、ヘルスチェック、フェイルオーバー  |
| **セキュリティ**       | WAF                           | Webアプリケーションファイアウォール | Core Rule Set, SQLi, XSS, Rate Limit                      | $10-50         | SQLインジェクション/XSS/DDoS対策                    |
|                        | ACM                           | SSL/TLS証明書                       | ワイルドカード証明書                                      | 無料           | HTTPS通信の暗号化、ブラウザ信頼                     |
|                        | Security Group                | ファイアウォール                    | ALB/ECS/Aurora用                                          | 無料           | きめ細かいアクセス制御                              |
|                        | IAM Role                      | 権限管理                            | ECS Task Role, Execution Role                             | 無料           | 最小権限の原則に基づくアクセス制御                  |
| **データベース**       | Aurora Serverless v2          | RDB                                 | PostgreSQL 17.6 / Multi-AZ (2インスタンス) / 0.5-2 ACU    | $88-176        | 自動スケーリング、高可用性、読み取り負荷分散        |
|                        | RDS Automated Backups         | 自動バックアップ                    | 30日保持                                                  | $10            | ポイントインタイムリカバリ対応                      |
| **ストレージ**         | S3                            | オブジェクトストレージ              | Standard + IA / バージョニング有効                        | $5             | 静的アセット配信、低コスト                          |
|                        | ECR                           | コンテナレジストリ                  | 30イメージ保持                                            | $5             | Dockerイメージ管理                                  |
| **モニタリング**       | CloudWatch Logs               | ログ管理                            | 30日保持 / 約10GB/月想定                                  | $5             | アプリケーションログの集約                          |
|                        | CloudWatch Container Insights | コンテナメトリクス                  | ECSクラスター監視                                         | $3             | ECSタスクの詳細メトリクス                           |
|                        | Datadog                       | APM/インフラ監視                    | 4ホスト相当                                               | $62            | 統合監視、異常検知、アラート                        |
|                        | Sentry                        | エラー監視                          | Free Plan (5,000 errors/月)                               | 無料           | Next.jsのエラー追跡、スタックトレース               |
| **その他**             | Bastion Host (EC2)            | メンテナンス用                      | t3.nano                                                   | $3             | DB直接アクセス、トラブルシューティング              |
|                        | SSM セッション Manager        | セキュアアクセス                    | -                                                         | 無料           | Bastionへの安全なアクセス                           |

- **合計コスト概算**: $190.50-620.50/月

- **平常時** (最小構成): 約$190.50/月
  - ECS: 2タスク (Web + API 各1) = $44
  - Aurora: Multi-AZ 0.5 ACU × 2 = $88
  - その他固定費: $58.50
- **ピーク時** (最大構成): 約$620.50/月
  - ECS: 20タスク (Web + API 各10) = $440
  - Aurora: Multi-AZ 2 ACU × 2 = $176
  - その他固定費: $58.50
- **平均想定**: 約$250-350/月

**コスト内訳**:

- Route53: $0.50/月（ホストゾーン）+ クエリ料金（100万クエリあたり$0.40）
- ACM証明書: 無料（パブリック証明書）
- WAF: $10-50/月（リクエスト数に応じて変動）

- **ECS高可用性構成への変更**: さらに冗長性が必要になったら

- `compute/terragrunt.hcl`: `web_count = 2`, `api_count = 2`, `min_capacity = 2`（+$44/月）
- メリット: 1タスク障害時も継続稼働、ゼロダウンタイムデプロイ

## Terragrunt構成図

```mermaid
graph TB
    subgraph "envs/prod/"
        Root[root.hcl<br>共通設定<br>backend/provider]
        Env[env.hcl<br>環境変数<br>project_name/environment]
        Local[.tfvars.local<br>機密情報<br>Sentry/Datadog]

        subgraph "Modules"
            ECR[ecr/<br>ECRリポジトリ]
            Network[network/<br>VPC/サブネット/NAT]
            Security[security/<br>SG/IAM/WAF]
            Database[database/<br>Aurora Serverless v2]
            Storage[storage/<br>S3バケット]
            Monitoring[monitoring/<br>Datadog/Sentry]
            Compute[compute/<br>ECS/ALB/AutoScaling]
        end
    end

    Root -.->|include| ECR
    Root -.->|include| Network
    Root -.->|include| Security
    Root -.->|include| Database
    Root -.->|include| Storage
    Root -.->|include| Monitoring
    Root -.->|include| Compute

    Env -.->|include| ECR
    Env -.->|include| Network
    Env -.->|include| Security
    Env -.->|include| Database
    Env -.->|include| Storage
    Env -.->|include| Monitoring
    Env -.->|include| Compute

    Local -.->|include| Monitoring
    Local -.->|include| Compute

    Network -->|vpc_id<br>subnet_ids| Security
    Network -->|vpc_id<br>subnet_ids| Database
    Network -->|vpc_id<br>subnet_ids| Compute

    Security -->|sg_ids<br>iam_roles<br>waf_arn| Compute
    Security -->|db_sg_id| Database

    ECR -->|repository_url| Compute
    Database -->|endpoint| Compute
    Monitoring -->|sentry_dsn| Compute

    style Root fill:#e1f5ff
    style Env fill:#e1f5ff
    style Local fill:#ffe1e1
    style Network fill:#c7ecee
    style Security fill:#ffd6a5
    style Compute fill:#caffbf
```

### 依存関係の説明

1. **Phase 1: ECRリポジトリ**
   - ECR: コンテナイメージリポジトリ（最初に作成が必要）

2. **Phase 2: Dockerイメージ**
   - コンテナイメージのビルド＆プッシュ（Compute層で使用）

3. **Phase 3: ネットワークとセキュリティ** (Phase 2完了後、並列実行可能)
   - Network: VPC、サブネット、NAT Gateway
   - Security: セキュリティグループ、IAMロール、WAF

4. **Phase 4: データ層** (Phase 3完了後)
   - Storage: S3バケット (Network依存)
   - Monitoring: Datadog/Sentry設定 (独立)
   - Database: Aurora (Network, Security依存)

5. **Phase 5: Prismaマイグレーション** (Phase 4完了後)
   - データベーススキーマとテーブルの作成

6. **Phase 6: アプリケーション層** (Phase 5完了後)
   - Compute: ECS、ALB、Auto Scaling (全依存)

## ディレクトリ構成

``` txt
infra/terraform/envs/prod/
├── root.hcl                    # 共通設定: backend (S3), provider (AWS), region
├── env.hcl                     # 環境変数: project_name, environment, tags
├── .tfvars.local               # 機密情報 (gitignore): Sentry/Datadog設定
├── .tfvars.local.example       # 設定テンプレート
├── README.md                   # このファイル
│
├── ecr/
│   └── terragrunt.hcl         # ECRリポジトリ設定 (Web/API)
│
├── network/
│   └── terragrunt.hcl         # VPC (10.1.0.0/16), Public/Private Subnet, NAT Gateway
│
├── security/
│   └── terragrunt.hcl         # Security Groups, IAM Roles, WAF
│
├── database/
│   └── terragrunt.hcl         # Aurora Serverless v2 (Multi-AZ, 0.5-2 ACU)
│
├── storage/
│   └── terragrunt.hcl         # S3 (バージョニング, ライフサイクル, CORS)
│
├── monitoring/
│   └── terragrunt.hcl         # Datadog, Sentry設定
│
└── compute/
    └── terragrunt.hcl         # ECS (Web/API), ALB, Auto Scaling

modules/                        # 再利用可能なTerraformモジュール
├── network/                   # VPC, Subnet, NAT Gateway, VPC Endpoint
├── security/                  # Security Group, IAM Role, WAF
├── database/                  # Aurora Serverless v2
├── storage/                   # S3 Bucket
├── monitoring/                # Datadog, Sentry Provider
├── compute/                   # ECS, ALB, Auto Scaling
└── ecr/                       # ECR Repository
```

### ファイルの役割

| ファイル           | 役割                 | 内容                                                             |
| ------------------ | -------------------- | ---------------------------------------------------------------- |
| `root.hcl`         | Terragrunt共通設定   | S3バックエンド、AWSプロバイダー、リージョン設定                  |
| `env.hcl`          | 環境固有の変数       | `project_name`, `environment`, 共通タグ                          |
| `.tfvars.local`    | 機密情報 (gitignore) | `sentry_organization`, `sentry_team`, `alert_email`, Datadogキー |
| `*/terragrunt.hcl` | モジュール設定       | 各モジュールの入力変数、依存関係定義                             |

## 環境構築手順

### 1. 前提条件の確認

**Bash:**

```bash
# AWS CLI認証情報確認
aws sts get-caller-identity

# Terragrunt インストール確認
terragrunt --version  # 0.93.0以上

# 環境変数設定
export AWS_REGION=ap-northeast-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Sentry認証トークン設定
export SENTRY_AUTH_TOKEN=your-sentry-token
```

**Fish:**

```fish
# AWS CLI認証情報確認
aws sts get-caller-identity

# Terragrunt インストール確認
terragrunt --version  # 0.93.0以上

# 環境変数設定
set -x AWS_REGION ap-northeast-1
set -x AWS_ACCOUNT_ID (aws sts get-caller-identity --query Account --output text)

# Sentry認証トークン設定
set -x SENTRY_AUTH_TOKEN your-sentry-token
```

### 2. ローカル設定ファイルの作成

```bash
cd infra/terraform/envs/prod

# .tfvars.local.example をコピー
cp .tfvars.local.example .tfvars.local

# 以下の値を編集
# - sentry_organization: SentryのOrganization Slug
# - sentry_team: SentryのTeam Slug
# - alert_email: アラート通知先メールアドレス
vim .tfvars.local
```

### 3. ドメイン購入（Route53）

⚠️ **重要**: インフラストラクチャをデプロイする前に、Route53でドメインを購入してください。これにより、Compute層デプロイ時に自動的にHTTPS化が完了します。

#### ステップ1: AWS Consoleでドメイン購入

1. **AWS Console** → **Route53** → **Registered domains** → **Register domain**
2. `tidilyspace.com` を検索
3. カートに追加して購入手続き
   - **価格**: 約$13/年（.comドメイン）
   - **自動更新**: 有効推奨
   - **プライバシー保護**: 有効推奨
4. 連絡先情報を入力
5. 購入完了（**通常10-30分で登録完了**）

#### ステップ2: ドメイン登録の確認

⚠️ **Region指定について**: Route53 Domains APIは`us-east-1`リージョンでのみ利用可能です。インフラストラクチャ自体は`ap-northeast-1`にデプロイされますが、ドメイン関連の操作のみ`--region us-east-1`を指定してください。

```bash
# ドメインが登録されたか確認
aws route53domains get-domain-detail --domain-name tidilyspace.com --region us-east-1 --query 'DomainName' --output text
# 出力例: tidilyspace.com

# ドメインのステータス確認
aws route53domains get-domain-detail --domain-name tidilyspace.com --region us-east-1 --query 'StatusList' --output json
# 出力例: ["clientTransferProhibited"]
```

#### ステップ3: ネームサーバーの確認と調整

Route53でドメインを購入すると、自動的に新しいホストゾーンが作成されます。しかし、Terraformで既にホストゾーンを作成済みなので、既存のホストゾーンを使用するように調整します。

```bash
# Route53購入時に自動作成されたホストゾーンのネームサーバーを確認
aws route53domains get-domain-detail --domain-name tidilyspace.com --region us-east-1 --query 'Nameservers[*].Name' --output json

# Terraformで作成済みの既存ホストゾーンのネームサーバーを確認
aws route53 list-hosted-zones --query "HostedZones[?Name=='tidilyspace.com.'].Id" --output text
# 出力例: /hostedzone/Z02049501824CSY6XOD0V

aws route53 get-hosted-zone --id Z02049501824CSY6XOD0V --query 'DelegationSet.NameServers' --output json
# 出力例:
# [
#   "ns-1641.awsdns-13.co.uk",
#   "ns-897.awsdns-48.net",
#   "ns-1059.awsdns-04.org",
#   "ns-240.awsdns-30.com"
# ]
```

**ネームサーバーの統一**:

もし異なるネームサーバーが設定されている場合、以下の手順で既存のホストゾーンに統一してください。

1. **AWS Console** → **Route53** → **Registered domains** → **tidilyspace.com**
2. 右上の「**Add or edit name servers**」をクリック
3. 既存のホストゾーンのネームサーバー（4つ）を入力
4. 保存

または、AWS CLIで変更。

```bash
# ネームサーバーを既存のホストゾーンに変更
aws route53domains update-domain-nameservers \
  --region us-east-1 \
  --domain-name tidilyspace.com \
  --nameservers \
    Name=ns-1641.awsdns-13.co.uk \
    Name=ns-897.awsdns-48.net \
    Name=ns-1059.awsdns-04.org \
    Name=ns-240.awsdns-30.com
```

#### ステップ4: 不要なホストゾーンの削除（オプション）

Route53購入時に自動作成されたホストゾーンは不要なので削除できます（月額$0.50の節約）。

```bash
# 自動作成されたホストゾーンを特定
aws route53 list-hosted-zones --query "HostedZones[?Name=='tidilyspace.com.']" --output json

# Terraformで作成したホストゾーンIDと比較して、異なる方を削除
# 削除前にレコードを確認
aws route53 list-resource-record-sets --hosted-zone-id <自動作成されたホストゾーンID> --output json

# NS/SOAレコードのみの場合は安全に削除可能
aws route53 delete-hosted-zone --id <自動作成されたホストゾーンID>
```

#### ステップ5: compute/terragrunt.hcl の設定確認

Compute層をHTTPS対応でデプロイするため、`enable_acm = true` に設定されていることを確認してください。

```bash
cd infra/terraform/envs/prod/compute
grep "enable_acm" terragrunt.hcl
# 出力: enable_acm = true
```

もし `false` になっている場合は、`true` に変更してください。

### 4. 環境変数とシークレットの設定

インフラストラクチャをデプロイする前に、SSM Parameter StoreとAWS Secrets Managerに必要な環境変数とシークレットを設定します。

#### SSM Parameter Storeへの環境変数設定

**MongoDB接続文字列の設定**:

```bash
# MongoDB Atlas接続文字列を設定
aws ssm put-parameter \
  --name "/bookmark-manager/prod/MONGODB_URI" \
  --value "mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority" \
  --type "SecureString" \
  --region ap-northeast-1
```

**注意**:

- MongoDB Atlasのアカウント作成と接続文字列の取得が必要
- 接続文字列にはユーザー名、パスワード、クラスタ名、データベース名が含まれる
- 本番環境では専用のMongoDBクラスターを使用することを推奨

**その他の環境変数（必要に応じて）**:

```bash
# JWT_SECRET（認証機能実装時に設定）
# aws ssm put-parameter \
#   --name "/bookmark-manager/prod/JWT_SECRET" \
#   --value "your-secret-key" \
#   --type "SecureString" \
#   --region ap-northeast-1
```

#### AWS Secrets Managerへのシークレット設定

⚠️ **重要**: 以下のシークレットはstaging環境作成時に既に作成済みの場合、本番環境でも共有されます。初回のみ作成が必要です。

**Sentry Auth Token（Terraform Provider用）**:

```bash
# Sentry Internal Integration作成（必須権限: Project:Admin, Team:Read, Organization:Read, Issue&Event:Write）
aws secretsmanager create-secret \
  --name "sentry/auth_token" \
  --description "Sentry Auth Token for Terraform Provider" \
  --secret-string "your-sentry-internal-integration-token" \
  --region ap-northeast-1
```

**Datadog API Key（データ送信用）**:

```bash
# Datadog API Key作成
aws secretsmanager create-secret \
  --name "datadog/api_key" \
  --description "Datadog API Key for Datadog Agent" \
  --secret-string "your-datadog-api-key-32-chars" \
  --region ap-northeast-1
```

**Datadog App Key（Terraform Provider用）**:

```bash
# Datadog App Key作成（必須スコープ: dashboards_read/write, monitors_read/write）
aws secretsmanager create-secret \
  --name "datadog/app_key" \
  --description "Datadog App Key for Terraform Provider" \
  --secret-string "your-datadog-app-key-40-chars" \
  --region ap-northeast-1
```

**シークレット設定の確認**:

```bash
# SSM Parameter Storeの確認
aws ssm get-parameter \
  --name "/bookmark-manager/prod/MONGODB_URI" \
  --with-decryption \
  --region ap-northeast-1

# Secrets Managerの確認
aws secretsmanager list-secrets \
  --region ap-northeast-1 \
  --query 'SecretList[?Name==`sentry/auth_token` || Name==`datadog/api_key` || Name==`datadog/app_key`].[Name,Description]' \
  --output table
```

### 5. インフラストラクチャのデプロイ

#### Phase 1: 基礎インフラ

```bash
cd infra/terraform/envs/prod

# ECRリポジトリ作成
cd ecr && terragrunt apply -auto-approve
```

#### Phase 2: Dockerイメージのビルド＆プッシュ

⚠️ **重要**: Compute層(ECS)をデプロイする前に、ECRにコンテナイメージをプッシュしておく必要があります。

**Bash:**

```bash
# ECRログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-1.amazonaws.com

# プロジェクトルートへ移動
cd ../../../../

# Webイメージのビルド＆プッシュ
docker build --platform linux/amd64 -t bookmark-manager-prod-web -f src/apps/frontend/web/Dockerfile .
docker tag bookmark-manager-prod-web:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-web:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-web:latest

# APIイメージのビルド＆プッシュ
docker build --platform linux/amd64 -t bookmark-manager-prod-api -f src/apps/web-api/core/Dockerfile .
docker tag bookmark-manager-prod-api:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-api:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-api:latest

# インフラディレクトリに戻る
cd infra/terraform/envs/prod
```

**Fish:**

```bash
# ECRログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com

# プロジェクトルートへ移動
cd ../../../../

# Webイメージのビルド＆プッシュ
docker build --platform linux/amd64 -t bookmark-manager-prod-web -f src/apps/frontend/web/Dockerfile .
docker tag bookmark-manager-prod-web:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-web:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-web:latest

# APIイメージのビルド＆プッシュ
docker build --platform linux/amd64 -t bookmark-manager-prod-api -f src/apps/web-api/core/Dockerfile .
docker tag bookmark-manager-prod-api:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-api:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-api:latest

# インフラディレクトリに戻る
cd infra/terraform/envs/prod
```

#### Phase 3: ネットワークとセキュリティ（並列実行可能）

```bash
# ネットワークとセキュリティの構築
cd network && terragrunt apply -auto-approve
cd ../security && terragrunt apply -auto-approve
```

#### Phase 4: データ層

```bash
# ストレージとモニタリングの構築
cd storage && terragrunt apply -auto-approve
cd ../monitoring && terragrunt apply -auto-approve

# データベースの構築（⚠️ 約10-15分かかります）
cd ../database && terragrunt apply -auto-approve
```

#### Phase 5: Prismaマイグレーションの実行

データベースが構築されたら、Prismaマイグレーションを実行してテーブルを作成します。

⚠️ **重要**: Auroraはプライベートサブネットにあるため、ローカルから直接アクセスできません。SSMポートフォワーディング経由で接続する必要があります。

##### ステップ1: 環境変数ファイルの準備

**Bash:**

```bash
# プロジェクトルートで実行

# SSM Parameter StoreからDATABASE_URLを取得して設定
# localhost経由でアクセスするため、エンドポイントをlocalhostに変更
aws ssm get-parameter \
  --name "/bookmark-manager/prod/DATABASE_URL" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text

# 取得したURLのホスト部分をlocalhostに置き換えて.env.prodに設定
# 例: postgresql://dbadmin:PASSWORD@localhost:5432/bookmarkdb
```

**Fish:**

```bash
# プロジェクトルートで実行

# SSM Parameter StoreからDATABASE_URLを取得して設定
# localhost経由でアクセスするため、エンドポイントをlocalhostに変更
aws ssm get-parameter \
  --name "/bookmark-manager/prod/DATABASE_URL" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text

# 取得したURLのホスト部分をlocalhostに置き換えて.env.prodに設定
# 例: postgresql://dbadmin:PASSWORD@localhost:5432/bookmarkdb
```

`.env.prod`の例。

``` txt
<!-- DATABASE_URLのパスワードに含まれる特殊文字はURLエンコードする -->
DATABASE_URL="postgresql://dbadmin:YOUR_PASSWORD@localhost:5432/bookmarkdb"
```

##### ステップ2: SSMポートフォワーディングの開始

別ターミナルで、Bastion EC2経由でAuroraへのポートフォワーディングを確立します。

```bash
# 別ターミナルで実行
./scripts/connect_to_awsdb.sh prod 5432

# 以下の情報が表示されます:
# - ホスト: localhost
# - ポート: 5432
# - データベース: bookmarkdb
# - ユーザー名: dbadmin
# - パスワード: (表示されます)
```

**トラブルシューティング**:

- Bastionインスタンスが停止している場合、起動してください
- SSM セッション Manager Pluginがインストールされていることを確認してください

##### ステップ3: マイグレーションの実行

ポートフォワーディングが確立したら、元のターミナルでマイグレーションを実行します。

```bash
# .env.prodを使用してマイグレーション実行
pnpm dotenv -e .env.prod -- prisma migrate deploy \
  --schema=src/libs/prisma/schema.prisma

# シードデータの投入（必要に応じて）
pnpm dotenv -e .env.prod -- prisma db seed \
  --schema=src/libs/prisma/schema.prisma
```

**注意**:

- `migrate deploy`は本番環境用のマイグレーションコマンドで、プロンプトなしで実行される
- ローカル開発では`migrate dev`を使用しますが、本番環境では`migrate deploy`を使用する
- ポートフォワーディングが確立している間のみマイグレーションが可能

##### ステップ4: マイグレーション確認

```bash
# Prisma Studioでテーブルを確認
pnpm dotenv -e .env.prod -- prisma studio \
  --schema=src/libs/prisma/schema.prisma

# または、psqlコマンドで確認（ポートフォワーディング確立中）
psql "postgresql://dbadmin:<PASSWORD>@localhost:5432/bookmarkdb"

# テーブル一覧を表示
\dt

# 接続を終了
\q
```

##### ステップ5: ポートフォワーディングの終了

マイグレーションが完了したら、ポートフォワーディングを終了します。

```bash
# ポートフォワーディングを実行しているターミナルで Ctrl+C を押す
```

#### Phase 6: アプリケーション層（HTTPS対応）

ドメイン購入が完了したら（セクション3参照）、HTTPS対応でCompute層をデプロイします。

```bash
# ECS、ALB、Auto Scalingの構築
cd ../compute && terragrunt apply -auto-approve

# ACM証明書のステータス確認（5-10分で検証完了）
aws acm describe-certificate --certificate-arn $(terragrunt output -raw acm_certificate_arn) --region ap-northeast-1 --query 'Certificate.Status' --output text
# 出力: ISSUED （検証完了）
```

### 6. デプロイ確認

**Bash:**

```bash
# Webサイト URL を取得（HTTPSで自動リダイレクト）
cd compute
terragrunt output website_url

# 出力例: https://tidilyspace.com

# ヘルスチェック（HTTPS）
DOMAIN=$(terragrunt output -raw domain_name)
curl -I https://${DOMAIN}/health          # Next.jsヘルスチェック（HTTPS）
curl -I https://${DOMAIN}/api/health      # NestJSヘルスチェック（HTTPS）

# HTTPからHTTPSへのリダイレクト確認
curl -I http://${DOMAIN}/health           # 301リダイレクト -> HTTPS

# wwwサブドメインも動作確認
curl -I https://www.${DOMAIN}/health

# ECSタスク状態確認
aws ecs describe-services \
  --cluster bookmark-manager-prod-cluster \
  --services bookmark-manager-prod-web bookmark-manager-prod-api \
  --query 'services[*].{Name:serviceName,Running:runningCount,Desired:desiredCount,Status:status}' \
  --output table

# Auroraエンドポイント確認
cd ../database
terragrunt output db_endpoint
```

**Fish:**

```bash
# Webサイト URL を取得（HTTPSで自動リダイレクト）
cd compute
terragrunt output website_url

# 出力例: https://tidilyspace.com

# ヘルスチェック（HTTPS）
set DOMAIN (terragrunt output -raw domain_name)
curl -I https://$DOMAIN/health          # Next.jsヘルスチェック（HTTPS）
curl -I https://$DOMAIN/api/health      # NestJSヘルスチェック（HTTPS）

# HTTPからHTTPSへのリダイレクト確認
curl -I http://$DOMAIN/health           # 301リダイレクト -> HTTPS

# wwwサブドメインも動作確認
curl -I https://www.$DOMAIN/health

# ECSタスク状態確認
aws ecs describe-services \
  --cluster bookmark-manager-prod-cluster \
  --services bookmark-manager-prod-web bookmark-manager-prod-api \
  --query 'services[*].{Name:serviceName,Running:runningCount,Desired:desiredCount,Status:status}' \
  --output table

# Auroraエンドポイント確認
cd ../database
terragrunt output db_endpoint
```

### 7. WAF動作確認

**Bash:**

```bash
DOMAIN=$(terragrunt output -raw domain_name)

# 正常なリクエスト (200 OK)
curl -I https://${DOMAIN}/health

# SQLインジェクション試行 (403 Forbidden - WAFでブロック)
curl -I "https://${DOMAIN}/?id=1' OR '1'='1"

# XSS試行 (403 Forbidden - WAFでブロック)
curl -I "https://${DOMAIN}/?q=<script>alert('XSS')</script>"

# WAFメトリクス確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/WAFV2 \
  --metric-name BlockedRequests \
  --dimensions Name=WebACL,Value=bookmark-manager-prod-waf Name=Region,Value=ap-northeast-1 \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

**Fish:**

```bash
set DOMAIN (terragrunt output -raw domain_name)

# 正常なリクエスト (200 OK)
curl -I https://$DOMAIN/health

# SQLインジェクション試行 (403 Forbidden - WAFでブロック)
curl -I "https://$DOMAIN/?id=1' OR '1'='1"

# XSS試行 (403 Forbidden - WAFでブロック)
curl -I "https://$DOMAIN/?q=<script>alert('XSS')</script>"

# WAFメトリクス確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/WAFV2 \
  --metric-name BlockedRequests \
  --dimensions Name=WebACL,Value=bookmark-manager-prod-waf Name=Region,Value=ap-northeast-1 \
  --start-time (date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time (date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

### 8. SSL/TLS証明書確認

**Bash:**

```bash
DOMAIN=$(terragrunt output -raw domain_name)

# SSL証明書情報確認
openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} </dev/null 2>/dev/null | openssl x509 -noout -text

# SSL Labs でセキュリティ評価（ブラウザで確認）
echo "https://www.ssllabs.com/ssltest/analyze.html?d=${DOMAIN}"

# ブラウザでHTTPS接続確認
echo "https://${DOMAIN}"
```

**Fish:**

```bash
set DOMAIN (terragrunt output -raw domain_name)

# SSL証明書情報確認
openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | openssl x509 -noout -text

# SSL Labs でセキュリティ評価（ブラウザで確認）
echo "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"

# ブラウザでHTTPS接続確認
echo "https://$DOMAIN"
```

### 9. Auto Scaling動作確認

**Bash:**

```bash
DOMAIN=$(terragrunt output -raw domain_name)

# 負荷テスト (Apache Bench使用)
ab -n 10000 -c 100 https://${DOMAIN}/

# スケーリング状態監視 (別ターミナルで実行)
watch -n 10 'aws ecs describe-services \
  --cluster bookmark-manager-prod-cluster \
  --services bookmark-manager-prod-web \
  --query "services[0].{Desired:desiredCount,Running:runningCount,Pending:pendingCount}" \
  --output table'
```

**Fish:**

```bash
set DOMAIN (terragrunt output -raw domain_name)

# 負荷テスト (Apache Bench使用)
ab -n 10000 -c 100 https://$DOMAIN/

# スケーリング状態監視 (別ターミナルで実行)
watch -n 10 'aws ecs describe-services \
  --cluster bookmark-manager-prod-cluster \
  --services bookmark-manager-prod-web \
  --query "services[0].{Desired:desiredCount,Running:runningCount,Pending:pendingCount}" \
  --output table'
```

## ネットワーク

- **VPC CIDR**: 10.1.0.0/16
- **NAT Gateway**: 有効（Single-AZ、コスト最適化）
- **ECS配置**: プライベートサブネット（セキュリティ強化）
- **Bastion**: t3.nano（マイグレーション用）

### セキュリティ

- **ALB IP制限**: なし（0.0.0.0/0からアクセス可能）
- **WAF**: 推奨（別途実装）

### データベース

- **エンジン**: Aurora Serverless v2
- **構成**: Multi-AZ（Writer + Reader の2インスタンス）
  - **Writer**: 書き込み/読み取りを処理
  - **Reader**: 読み取り専用（負荷分散）
  - **フェイルオーバー**: Writer障害時にReaderが自動昇格（1-2分で復旧）
- **スケーリング**: 0.5-2 ACU（インスタンスごと）
- **バックアップ**: 30日保持
- **削除保護**: 有効

### コンピューティング

- **Web (Next.js)**:
  - CPU: 1024 (1 vCPU)
  - Memory: 2048 MB
  - 初期タスク数: 1
  - オートスケーリング: 1-10タスク
  - **スケールアウト**: CPU 70％/メモリ 80％ 超過時（1分クールダウン）
  - **スケールイン**: CPU 70％/メモリ 80％ 未満時（5分クールダウン）
- **API (NestJS)**:
  - CPU: 1024 (1 vCPU)
  - Memory: 2048 MB
  - 初期タスク数: 1
  - オートスケーリング: 1-10タスク
  - **スケールアウト**: CPU 70％/メモリ 80％ 超過時（1分クールダウン）
  - **スケールイン**: CPU 70％/メモリ 80％ 未満時（5分クールダウン）
- **稼働時間**: 24時間稼働
- **Container Insights**: 有効
- **CloudWatch Logs**: 30日保持

- **ECS高可用性構成への変更**: さらに冗長性が必要になったら

- `compute/terragrunt.hcl`: `web_count = 2`, `api_count = 2`, `min_capacity = 2`
- メリット: 1タスク障害時も継続稼働、ゼロダウンタイムデプロイ

### ストレージ

- **S3バージョニング**: 有効
- **ライフサイクル**: IA移行180日、削除730日
- **CORS**: tidilyspace.com

### ECR

- **保持イメージ数**: 30
- **削除保護**: 有効（force_delete: false）

## デプロイ手順

### 前提条件

1. AWS CLIが設定されていること
2. `.tfvars.local` ファイルが作成されていること（Sentry/Datadog設定）
3. Dockerがインストールされていること

### 段階的デプロイ（推奨）

```bash
cd infra/terraform/envs/prod

# Phase 1: 基礎インフラ
cd ecr && terragrunt apply              # ECRリポジトリ作成

# ⚠️ Phase 2: Dockerイメージをビルド&プッシュ（手順は「環境構築手順 > Phase 2」参照）

# Phase 3: ネットワークとセキュリティ
cd network && terragrunt apply          # VPC/サブネット/NAT
cd ../security && terragrunt apply       # SG/IAM/WAF

# Phase 4: データ層
cd ../storage && terragrunt apply        # S3バケット
cd ../monitoring && terragrunt apply     # Datadog/Sentry
cd ../database && terragrunt apply       # Aurora（約10-15分）

# ⚠️ Phase 5: Prismaマイグレーション実行（手順は「環境構築手順 > Phase 5」参照）

# Phase 6: アプリケーション層（HTTPS対応）
cd ../compute && terragrunt apply        # ECS/ALB/Auto Scaling
```

### 一括デプロイ（推奨しない）

⚠️ **注意**: 依存関係が複雑なため、段階的デプロイを推奨します。特にECRイメージのプッシュは手動で行う必要があります。

```bash
cd infra/terraform/envs/prod
terragrunt run --all apply
```

## 検証

### 構文チェック

```bash
cd infra/terraform/envs/prod
terragrunt run --all validate
```

### 実行計画の確認

```bash
terragrunt run --all plan
```

### ALBヘルスチェック

```bash
# ALB URLを取得
cd compute
terragrunt output alb_dns_name

# ヘルスチェック
curl http://<ALB_DNS_NAME>/health
```

### オートスケーリング動作確認

**Bash:**

```bash
# ECSタスク数を監視
aws ecs describe-services \
  --cluster bookmark-manager-prod-cluster \
  --services bookmark-manager-prod-web bookmark-manager-prod-api \
  --query 'services[*].{Name:serviceName,Running:runningCount,Desired:desiredCount}' \
  --output table

# CloudWatch Metricsで詳細確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name DesiredTaskCount \
  --dimensions Name=ServiceName,Value=bookmark-manager-prod-web \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

**Fish:**

```bash
# ECSタスク数を監視
aws ecs describe-services \
  --cluster bookmark-manager-prod-cluster \
  --services bookmark-manager-prod-web bookmark-manager-prod-api \
  --query 'services[*].{Name:serviceName,Running:runningCount,Desired:desiredCount}' \
  --output table

# CloudWatch Metricsで詳細確認
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name DesiredTaskCount \
  --dimensions Name=ServiceName,Value=bookmark-manager-prod-web \
  --start-time (date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time (date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## 運用

### モニタリング

本番環境では実用的な監視設定を行い、適切なパフォーマンスとエラー追跡を実現します。

#### 監視ツール

- **Datadog**: ECS、Aurora、ALBのメトリクス監視
- **Sentry**: Next.jsエラー監視
- **CloudWatch Logs**: アプリケーションログ（30日保持）
- **Container Insights**: ECSコンテナの詳細メトリクス

#### Datadog設定（本番環境）

- **サンプリング率**: 20%
- **レート制限**: 50スパン/秒
- **プロファイリング**: 有効
- **ランタイムメトリクス**: 有効

**環境変数:**

```bash
NODE_ENV=production
DD_ENV=production
DD_SERVICE=bookmark-api
DD_VERSION=1.0.0
DD_AGENT_HOST=localhost
DD_TRACE_AGENT_PORT=8126
```

#### Sentry設定（本番環境）

**バックエンド（NestJS）:**

- 適用なし（Sentryはフロントエンドのみ使用）

**フロントエンド（Next.js）:**

- **エラー記録**: 100％（sampleRate: 1.0）
- **トレースサンプリング**: 20%
- **APIルート**: 100%
- **ページビュー**: 20%
- **セッションリプレイ**:
  - 通常時: 無効（0％）
  - エラー時: 10%

**環境変数:**

```bash
NODE_ENV=production
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

#### 環境別設定の実装箇所

**バックエンド（NestJS）:**

- ファイル: `src/apps/web-api/core/src/main.ts`
- Datadog設定は環境変数 `NODE_ENV` に基づいて動的に切り替わる

**フロントエンド（Next.js）:**

- `src/apps/frontend/web/instrumentation-client.ts`（クライアントサイド）
- `src/apps/frontend/web/sentry.server.config.ts`（サーバーサイド）
- `src/apps/frontend/web/sentry.edge.config.ts`（Edgeランタイム）
- Sentry設定は環境変数 `NODE_ENV` に基づいて動的に切り替わる

詳細は[モニタリング設計ドキュメント](../../../../docs/spec/docs/06-インフラ設計/07-monitoring.md)および[メインREADME](../../README.md#モニタリング設定環境別)を参照してください。

### バックアップ

- **Aurora**: 自動バックアップ30日保持、ポイントインタイムリカバリ対応
- **S3**: バージョニング有効、誤削除防止

### スケーリング

- **ECS Auto Scaling**:
  - **スケールアウト**: CPU 70％/メモリ 80％ 超過時、1分後に追加タスク起動
  - **スケールイン**: CPU 70％/メモリ 80％ 未満時、5分後にタスク削減
  - **Target Tracking**: 目標値を維持するよう自動調整
- **Aurora Auto Scaling**:
  - Writer/Reader それぞれ 0.5-2 ACU 間で自動スケーリング
  - CPU使用率に基づいて自動調整

### コスト最適化

- NAT Gateway: Single-AZ構成（約$32/月）
- VPC Endpoint: ECR/S3へのプライベート接続（データ転送料削減）
- オートスケーリング: 負荷に応じたタスク数調整

## トラブルシューティング

### ECSタスクが起動しない

```bash
# タスクログを確認
aws logs tail /ecs/bookmark-manager-prod-web --follow

# タスク定義を確認
aws ecs describe-task-definition --task-definition bookmark-manager-prod-web
```

### Aurora接続エラー

```bash
# Bastionホストを経由してDB接続確認
./scripts/connect_to_awsdb.sh production 5432

# 接続情報を確認
aws ssm get-parameter --name /bookmark-manager/prod/db/endpoint --with-decryption
```

### オートスケーリングが動作しない

```bash
# Auto Scaling設定を確認
aws application-autoscaling describe-scalable-targets \
  --service-namespace ecs \
  --resource-ids service/bookmark-manager-prod-cluster/bookmark-manager-prod-web

# スケーリングポリシーを確認
aws application-autoscaling describe-scaling-policies \
  --service-namespace ecs \
  --resource-id service/bookmark-manager-prod-cluster/bookmark-manager-prod-web
```

## セキュリティ

### アクセス制御

- **ALB**: 0.0.0.0/0からHTTP/HTTPSアクセス許可（一般公開サービス）
- **ECS**: プライベートサブネット配置、ALBからのみアクセス可能
- **Aurora**: プライベートサブネット配置、ECSとBastionからのみアクセス可能
- **Bastion**: SSM セッション Manager経由でアクセス

### 実装済みセキュリティ対策

- [x] **Route53 + ACM証明書** - HTTPS化（TLS 1.3）、独自ドメイン
- [x] **WAF導入** - SQLインジェクション、XSS、既知の悪意ある入力、レート制限（2000req/5分）
- [x] **プライベートサブネット配置** - ECS、Auroraをインターネットから分離
- [x] **セキュリティグループ** - 最小権限でのアクセス制御
- [x] **IAM Role** - ECS Task用の権限最小化
- [x] **削除保護** - Aurora、ALBの誤削除防止
- [x] **VPC Endpoint** - ECR/S3へのプライベート接続

### 推奨セキュリティ対策（未実装）

- [ ] **AWS Shield Advanced** - 高度なDDoS対策（$3,000/月、高トラフィック時のみ推奨）
- [ ] **CloudTrail** - API操作の監査ログ記録
- [ ] **GuardDuty** - 機械学習による脅威検知
- [ ] **AWS Config** - リソース設定の変更履歴管理
- [ ] **Secrets Manager** - DB認証情報のローテーション自動化

## ドメイン設定

### 現在のドメイン

- `tidilyspace.com`

## 削除

### 注意

本番環境のため、削除保護が有効になっています。削除前に以下を確認。

- データのバックアップ
- 最終スナップショットの取得
- 関係者への通知

### 削除手順

#### ステップ1: インフラストラクチャの削除

```bash
cd infra/terraform/envs/prod

# 削除保護を無効化（database/terragrunt.hcl, compute/terragrunt.hcl を編集）
# deletion_protection = false に変更

# 逆順で削除
cd compute && terragrunt destroy
cd ../database && terragrunt destroy
cd ../monitoring && terragrunt destroy
cd ../storage && terragrunt destroy
cd ../security && terragrunt destroy
cd ../network && terragrunt destroy
cd ../ecr && terragrunt destroy
```

#### ステップ2: Route53ホストゾーンの削除

Terraformで作成したホストゾーンを削除します。

```bash
# ホストゾーンIDを確認
aws route53 list-hosted-zones --query "HostedZones[?Name=='tidilyspace.com.'].Id" --output text
# 出力例: /hostedzone/Z02049501824CSY6XOD0V

# レコードを確認（NS/SOAのみであることを確認）
aws route53 list-resource-record-sets --hosted-zone-id Z02049501824CSY6XOD0V --output json

# ホストゾーンを削除（NS/SOAレコード以外のレコードがある場合は先に削除が必要）
aws route53 delete-hosted-zone --id Z02049501824CSY6XOD0V
```

#### ステップ3: ドメインの削除（オプション）

⚠️ **警告**: ドメインを削除すると、再取得が困難になる場合があります。慎重に検討してください。

**Route53でのドメイン削除**:

Route53で購入したドメインは、AWS Consoleから削除できます。

1. **AWS Console** → **Route53** → **Registered domains**
2. `tidilyspace.com` を選択
3. 右上の「**Delete domain**」をクリック
4. 確認メッセージに従って削除

または、AWS CLIで削除。

```bash
# ドメインの削除（自動更新を無効化して有効期限まで待つ）
aws route53domains update-domain-nameservers \
  --region us-east-1 \
  --domain-name tidilyspace.com \
  --nameservers Name=ns-000.awsdns-00.com

# 自動更新を無効化
aws route53domains disable-domain-auto-renew \
  --region us-east-1 \
  --domain-name tidilyspace.com
```

⚠️ **注意**:

- Route53でのドメイン削除は即座には実行されません
- 登録期間が終了するまで課金される
- ドメインを完全に削除するには、有効期限まで待つか、AWS Supportに連絡してください

### ドメインの再作成

削除したドメインを再度購入する場合は、「**3. ドメイン購入（Route53）**」セクションの手順に従ってください。

⚠️ **重要**:

- `.com`ドメインは人気が高いため、削除後すぐに第三者に取得される可能性がある
- 同じドメインの再取得を保証できません
- 継続して使用する予定がある場合は、削除せずに保持することを強く推奨

## 参考リンク

- [メインREADME](../../README.md)
- [Staging環境](../staging/README.md)
- [AWS ECS Auto Scaling](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html)
- [Aurora Serverless v2](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)
