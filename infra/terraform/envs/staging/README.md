# Staging環境 Terragrunt構成

## 概要

Terragruntを使用した**超コスト最適化**されたstaging環境のインフラ構成です。

**月額コスト: $90.20-101.20**（営業時間のみ稼働 + Datadog監視）、最大46%のコスト削減を実現しています。

**Datadog未使用の場合: $63-74**（最大65%削減）

**Secrets Manager追加コスト: +$1.20/月**（3つのシークレット × $0.40）

**新機能**: Bastion EC2インスタンス（t3.nano）を追加し、SSM Session Manager経由でRDSに安全に接続できます。

## 使用AWSサービス一覧

| カテゴリ               | サービス                      | 用途                          | 月額コスト（概算）                                                          |
| ---------------------- | ----------------------------- | ----------------------------- | --------------------------------------------------------------------------- |
| **コンピューティング** | ECS Fargate                   | コンテナ実行（Web + API）     | $20-25                                                                      |
|                        | EC2 (t3.nano)                 | Bastion Host                  | $3-4                                                                        |
|                        | Lambda                        | ECS自動停止/起動              | $0.1未満                                                                    |
|                        | EventBridge                   | スケジューラー                | $0 (無料枠)                                                                 |
| **ネットワーク**       | VPC                           | ネットワーク基盤              | $0                                                                          |
|                        | ALB                           | ロードバランサー              | $17.4                                                                       |
|                        | VPC Endpoint (Interface × 3)  | ECR/CloudWatch Logs           | $21.6                                                                       |
| **データベース**       | RDS PostgreSQL (db.t4g.micro) | メインDB                      | $11.5                                                                       |
| **ストレージ**         | S3                            | 静的アセット                  | $1-5                                                                        |
|                        | ECR                           | コンテナイメージ              | $0-1                                                                        |
| **モニタリング**       | CloudWatch Logs               | ログ保存 (7日)                | $5-10                                                                       |
|                        | Datadog Infrastructure Pro    | ECS + RDS監視（オプション）   | $25.8                                                                       |
|                        | Sentry                        | Next.jsエラー監視（無料）     | $0                                                                          |
| **セキュリティ**       | IAM                           | アクセス制御                  | $0                                                                          |
|                        | Security Group                | ファイアウォール              | $0                                                                          |
|                        | SSM Parameter Store           | 設定値管理（Sentry DSN）      | $0 (無料枠)                                                                 |
|                        | Secrets Manager               | 機密情報管理（3シークレット） | $1.20                                                                       |
| **合計**               |                               |                               | **$90.20-101.20/月**<br>（Datadog含む）<br>**$63-74/月**<br>（Datadog無し） |

## AWS構成概要

### アーキテクチャ構成図

```mermaid
graph TB
    User[ユーザー<br>固定IPのみ許可]
    Dev[開発者<br>SSM Session Manager]

    subgraph AWS["AWS (ap-northeast-1)"]
        subgraph VPC["VPC (10.0.0.0/16)"]
            subgraph PublicSubnet["Public Subnet<br>(NAT Gateway削除でコスト削減)"]
                ALB[ALB<br>ロードバランサー<br>IP制限あり]
                ECS_Web[ECS Fargate<br>Next.js SSR<br>0.25 vCPU / 512 MB]
                ECS_API[ECS Fargate<br>NestJS API<br>0.25 vCPU / 512 MB]
                Bastion[EC2 Bastion<br>t3.nano<br>DB接続用踏み台]
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
    Dev -->|SSM Session| Bastion
    ALB --> ECS_Web
    ALB --> ECS_API
    ECS_Web --> RDS
    ECS_API --> RDS
    Bastion -.Port Forward.- RDS
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
    style Bastion fill:#9f9,stroke:#333,stroke-width:2px
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
Internet (固定IPのみ) / 開発者 (SSM Session Manager)
    ↓                          ↓
┌─────────────────────────────────────────────┐
│ Public Subnet (NAT Gateway削除)             │
│   - ALB (IP制限あり)                        │
│   - ECS Fargate (Web + API)                 │
│     ※パブリックIP割り当て                   │
│   - EC2 Bastion (t3.nano)                   │
│     ※SSM Session Manager経由でアクセス      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│ Private Subnet                              │
│   - RDS PostgreSQL (db.t4g.micro)           │
│     ※ECS + Bastionからのアクセスのみ許可    │
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

## Datadog + Sentry監視（オプション）

### 概要

DatadogとSentryを組み合わせた効率的なモニタリング構成です。

**月額コスト: $25.8**（Datadog のみ、Sentryは無料枠）

- **Sentry**: Next.jsのエラー監視（無料枠: 月間5,000イベント）
- **Datadog**: ECS + RDS監視（Infrastructure Pro Plan）

### 監視対象

| 対象                    | サービス | 監視内容                       | 稼働時間          |
| ----------------------- | -------- | ------------------------------ | ----------------- |
| Next.js                 | Sentry   | エラー監視、セッションリプレイ | 24時間            |
| ECS Fargate (Web + API) | Datadog  | APM、メトリクス、ログ          | 月〜金 9:00-22:00 |
| RDS PostgreSQL          | Datadog  | CloudWatch統合、CPU/接続数     | 24時間            |

### コスト削減施策

#### 1. ECS自動停止/起動との連携 ⭐ 重要

- **削減効果**: ECSホスト課金 64%削減（$30 → $10.8）
- **仕組み**:
  - ECSタスク停止時、Datadog Agentサイドカーも自動停止
  - 営業時間外（22:00-9:00、土日）は課金なし
  - High Watermark Plan (HWMP) により上位1%のスパイク除外

**月間稼働時間**:
- ECS: 260時間/月（週5日×13時間×4週）
- RDS: 720時間/月（24時間稼働）

#### 2. CloudWatch統合の活用

- **RDS監視**: CloudWatch統合で十分（staging環境）
- **追加コスト**: なし（無料枠内）
- **Lambda関数**: 不要

#### 3. サンプリング設定

**Sentry (Next.js)**:
```typescript
Sentry.init({
  sampleRate: 1.0,              // エラーは全て記録
  tracesSampleRate: 0.05,       // トレース5%
  replaysSessionSampleRate: 0,  // 通常リプレイ無効
  replaysOnErrorSampleRate: 0.1, // エラー時10%
});
```

**Datadog (NestJS)**:
```typescript
tracer.init({
  sampleRate: 0.2,  // 20%サンプリング
  rateLimit: 50,    // 最大50スパン/秒
});
```

**環境変数設定**:
```bash
DD_TRACE_SAMPLING_RULES='[{"sample_rate":0.2}]'
DD_TRACE_RATE_LIMIT=50
DD_TRACE_LOG_LEVEL=error  # ERROR以上のみ
```

#### 4. メトリクス送信間隔の調整

```yaml
# datadog.yaml (オプション)
collect_interval: 60  # 60秒間隔（デフォルト: 15秒）
```

### セットアップ手順

#### 前提条件

1. **Sentryアカウント作成**
   - [Sentry.io](https://sentry.io/)でアカウント作成（無料）
   - 組織とチームを作成

2. **Datadogアカウント作成**
   - [Datadog](https://www.datadoghq.com/)でアカウント作成
   - 14日間無料トライアル利用可能
   - Infrastructure Pro Planを選択

#### Step 1: パッケージインストール

```bash
# ルートディレクトリで実行
pnpm install
```

追加されたパッケージ:
- `@sentry/nextjs`: Sentry SDK for Next.js
- `dd-trace`: Datadog APM for Node.js

#### Step 2: ローカル設定ファイル作成

```bash
cd infra/terraform/envs/staging

# サンプルファイルをコピー
cp .tfvars.local.example .tfvars.local

# 実際の値を設定（エディタで編集）
vi .tfvars.local
```

**`.tfvars.local`の内容例**:
```hcl
inputs = {
  sentry_organization = "<Sentry組織スラッグ>" 
  sentry_team         = "<Sentryチームスラッグ>"
  alert_email         = "<アラート通知先>"
}
```

**Sentry設定値の取得方法**:

| 項目                  | 取得場所                                            |
| --------------------- | --------------------------------------------------- |
| `sentry_organization` | Settings > Organization Settings > General Settings |
| `sentry_team`         | Settings > Teams > チーム名をクリック > URLの末尾   |

#### Step 3: Sentry Auth Tokenの取得と保存

1. **Sentry Internal Integrationを作成** ⚠️ **重要**

   **作成手順**:
   - Settings > Developer Settings > [Internal Integrations](https://sentry.io/settings/account/api/applications/)
   - **New Internal Integration** をクリック
   - **Name**: `Terraform Staging`
   - **Webhook URL**: （空欄でOK）
   - **必須Permissions（権限）** - これらがないとTerraformでエラーになります：
     - ✅ **Project**: `Admin`（プロジェクト作成・削除・変更）
     - ✅ **Team**: `Read`（チーム情報取得）
     - ✅ **Organization**: `Read`（組織情報取得）
     - ✅ **Issue & Event**: `Write`（アラート設定作成）
   - **Save Changes** をクリック
   - 生成されたトークンをコピー（`sntrys_xxxxx...`、表示は1回のみ！）

   **⚠️ 旧Auth Tokenを使用する場合**:
   - Settings > Developer Settings > [Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
   - "Create New Token" → Scopes: `project:admin`, `org:read`, `team:read`, `alerts:write`

2. **AWS Secrets Managerに保存**

```bash
# Sentry Auth Token保存（Terraform Provider用）
aws secretsmanager create-secret \
  --name "sentry/auth_token" \
  --description "Sentry Auth Token for Terraform Provider" \
  --secret-string "your-sentry-internal-integration-token" \
  --region ap-northeast-1

# 形式確認（デバッグ用）
aws secretsmanager get-secret-value --secret-id sentry/auth_token --query 'SecretString' --output text | head -c 20 && echo "..."
```

3. **ローカル設定ファイルを作成**

```bash
cd infra/terraform/envs/staging

# サンプルをコピー
cp .tfvars.local.example .tfvars.local

# エディタで編集
vim .tfvars.local
```

`.tfvars.local`の内容（Step 2で確認した値を設定）：
```hcl
inputs = {
  # Sentry設定
  sentry_organization = "hitamuki"           # Organization Slug
  sentry_team         = "bookmark-manager"   # Team Slug

  # アラート設定
  alert_email = "hitamuki024@gmail.com"
}
```

4. **確認: 全てのシークレットが作成されているか**

```bash
# 作成済みシークレット一覧を確認
aws secretsmanager list-secrets \
  --query 'SecretList[?contains(Name, `sentry`) || contains(Name, `datadog`)].Name' \
  --output table

# 期待される出力:
# ----------------------------
# |       ListSecrets        |
# +--------------------------+
# |  datadog/api_key         |
# |  datadog/app_key         |
# |  sentry/auth_token       |
# +--------------------------+
```

#### Step 4: Datadog設定

1. **Datadog API KeyとApp Keyを取得**

**API Key（データ送信用）**:
- Datadog > Organization Settings > [API Keys](https://app.datadoghq.com/organization-settings/api-keys)
- **New Key** をクリック
- **Name**: `Staging Environment`
- 生成されたキーをコピー

**App Key（Terraform用）**:
- Datadog > Organization Settings > [Application Keys](https://app.datadoghq.com/organization-settings/application-keys)
- **New Key** をクリック
- **Name**: `bookmark-manager`
- 生成されたキーをコピー

2. **AWS Secrets Managerに保存**

**Datadog API Keyの作成手順**:
1. Datadog UI → Organization Settings → API Keys
2. "New Key" をクリック
3. Name: `staging-api-key`（任意）
4. 作成されたKeyをコピー（32文字の16進数）

**Datadog Application Keyの作成手順** ⚠️ **重要**:
1. Datadog UI → Organization Settings → Application Keys
2. "New Key" をクリック
3. Name: `terraform-staging`
4. **必須スコープ**を選択（これらがないとTerraformで403エラーになります）：
   - ✅ `dashboards_read` - ダッシュボード読み取り
   - ✅ `dashboards_write` - ダッシュボード作成
   - ✅ `monitors_read` - モニター読み取り
   - ✅ `monitors_write` - モニター作成
   - ✅ `monitors_downtime` - ダウンタイム設定（オプション）
5. 作成されたKeyをコピー（40文字の英数字）

```bash
# API Key保存（Datadog Agent用）
# ⚠️ 注意: ダブルクォートや余分な文字を含めないこと
aws secretsmanager create-secret \
  --name "datadog/api_key" \
  --description "Datadog API Key for Datadog Agent" \
  --secret-string "your-datadog-api-key-32-chars" \
  --region ap-northeast-1

# App Key保存（Terraform Provider用）
# ⚠️ 注意: 上記で作成した適切なスコープ付きのKeyを使用
aws secretsmanager create-secret \
  --name "datadog/app_key" \
  --description "Datadog App Key for Terraform Provider" \
  --secret-string "your-datadog-app-key-40-chars" \
  --region ap-northeast-1

# 保存した値の形式確認（デバッグ用）
aws secretsmanager get-secret-value --secret-id datadog/api_key --query 'SecretString' --output text | wc -c  # 33が正常（32文字+改行）
aws secretsmanager get-secret-value --secret-id datadog/app_key --query 'SecretString' --output text | wc -c  # 41が正常（40文字+改行）
```

3. **Datadog Agentサイドカーを有効化**（compute/terragrunt.hcl）

```hcl
inputs = {
  # ...既存の設定...

  # Datadog有効化
  enable_datadog = true
  app_version    = "1.0.0"
}
```

4. **Terraform apply**（環境変数不要！）

```bash
# monitoring: Sentry + Datadog モニター・ダッシュボード作成
cd infra/terraform/envs/staging/monitoring
terragrunt apply
```

**注意**: API Key/App Keyは全てSecrets Managerから自動取得されるため、`export`コマンドは不要です！

**作成されるリソース**:
- ✅ Sentryプロジェクト: `bookmark-manager-web-staging`
- ✅ Sentry DSN → SSM Parameter Store: `/bookmark-manager/staging/SENTRY_DSN`
- ✅ Sentryアラート: Critical Errors - staging
- ✅ Datadogモニター × 3（APIエラーレート、レイテンシ、RDS CPU）
- ✅ Datadogダッシュボード: Bookmark Manager - staging

5. **Sentry DSNを取得してアプリケーションに設定**

**方法1: SSM Parameter Storeから取得**（推奨）
```bash
# コマンドで取得
aws ssm get-parameter \
  --name "/bookmark-manager/staging/SENTRY_DSN" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text

# 出力例:
# https://8145f9f0127b9487fc67e4940fa0e6b8@o4510377330999296.ingest.us.sentry.io/4510380263014400
```

**方法2: Sentry UIから取得**
1. https://hitamuki.sentry.io/settings/projects/bookmark-manager-web-staging/keys/
2. 「Client Keys (DSN)」セクション
3. 「DSN (Public)」をコピー

**compute/terragrunt.hclに追加**:
```hcl
web_environment = [
  # ... 既存の設定 ...
  {
    name  = "NEXT_PUBLIC_SENTRY_DSN"
    value = "https://8145f9f0127b9487fc67e4940fa0e6b8@o4510377330999296.ingest.us.sentry.io/4510380263014400"
  }
]

# Datadog監視設定も追加
enable_datadog = true
app_version    = "1.0.0"
```

**⚠️ セキュリティ注意**:
- Sentry DSNは**公開情報**なので、Gitにコミットしても問題ありません
- ブラウザのJavaScriptに埋め込まれるため、誰でも見ることができます
- DSNでできることは「エラーを送信する」だけです（読み取りや削除は不可）

6. **Datadog Agent + Sentry DSNをECSに適用**

```bash
cd infra/terraform/envs/staging/compute
terragrunt apply
```

**適用される変更**:
- ✅ ECSタスク定義にDatadog Agentサイドカーコンテナを追加
- ✅ Next.jsコンテナに`NEXT_PUBLIC_SENTRY_DSN`環境変数を追加
- ✅ Datadog環境変数（DD_ENV, DD_SERVICE, DD_VERSION等）を自動設定
- ✅ Secrets ManagerからDatadog API Keyを自動取得

**Datadog Agentサイドカーの役割**:
- APM（Application Performance Monitoring）トレース収集
- ログ収集（CloudWatch Logs経由）
- カスタムメトリクス収集
- ECS/Fargateメタデータ収集

7. **RDS CloudWatch統合を有効化**（Datadog側）

RDSメトリクスをDatadogで表示するには、AWS統合が必要です：

**手順**:
1. Datadog UI（https://ap1.datadoghq.com/）にログイン
2. Integrations → AWS を検索
3. "Add AWS Account" をクリック
4. 以下の情報を入力：
   - **Account ID**: `058570289018`
   - **Regions**: `ap-northeast-1` を選択
5. **Role Name**: DatadogがCloudFormationテンプレートを提供
6. **Collect metrics from**: `RDS` を選択
7. 保存

詳細: https://docs.datadoghq.com/ja/integrations/amazon_web_services/

#### Step 5: 動作確認

### Sentry（エラー監視）

**アクセス方法**:
1. Sentry UIにログイン: https://sentry.io/
2. Organization: `hitamuki`
3. Project: `bookmark-manager-web-staging`
4. 直接リンク: https://sentry.io/organizations/hitamuki/projects/bookmark-manager-web-staging/

**確認内容**:
- **Issues**: エラー一覧（新規エラー、頻出エラー）
- **Performance**: パフォーマンス監視（トレースサンプリング: 5%）
- **Alerts**: 設定したアラートルール
  - Settings → Alerts → "Critical Errors - staging"

**テスト方法**:
```typescript
// Next.jsアプリでテストエラーを発生させる
throw new Error("Sentry test error from staging!");
```

ブラウザで実行後、Sentry UI → Issues で確認できます。

---

### Datadog（インフラ・APM監視）

**アクセス方法**:
- Datadog UI: https://ap1.datadoghq.com/ （AP1リージョン）

**1. ダッシュボード**:
- 直接リンク: https://ap1.datadoghq.com/dashboard/n3w-s3y-enf/bookmark-manager---staging
- メニュー: Dashboards → "Bookmark Manager - staging"

**表示内容**:
- API Request Rate（リクエスト数）
- API Error Rate（エラー数）
- API Latency P95（95パーセンタイルレイテンシ）
- RDS CPU Utilization（RDS CPU使用率）
- RDS Database Connections（DB接続数）

**2. モニター（アラート）**:
- メニュー: Monitors → Manage Monitors
- 設定済みモニター:
  - `[staging] High Error Rate on Bookmark API` (ID: 10540299)
  - `[staging] High Latency on Bookmark API` (ID: 10540300)
  - `[staging] High CPU Usage on RDS PostgreSQL` (ID: 10540298)

**直接リンク**:
- https://ap1.datadoghq.com/monitors/10540299
- https://ap1.datadoghq.com/monitors/10540300
- https://ap1.datadoghq.com/monitors/10540298

**3. APM（アプリケーション監視）**:
- メニュー: APM → Services
- サービス名:
  - `bookmark-manager-web` (Next.js)
  - `bookmark-manager-api` (NestJS)

⚠️ **注意**: ECSタスクが起動してDatadog Agentが稼働するまで表示されません。

**4. ログ確認**:
- メニュー: Logs → Live Tail
- フィルター: `service:bookmark-manager-web` または `service:bookmark-manager-api`

**5. Infrastructure**:
- メニュー: Infrastructure → Containers
- ECSタスクの状態、メトリクスを確認

### トラブルシューティング

#### Terragrunt実行時のエラー

**エラー: `Error: failed to perform health check` (Sentry)**

```
Error: failed to perform health check
  with provider["registry.terraform.io/jianyuan/sentry"]
Sentry API is not available, Please check the authentication token
```

**原因と対処法**:
1. **Auth Tokenの権限不足** - Internal Integrationで以下のPermissionsが必要：
   - Project: `Admin`
   - Organization: `Read`
   - Team: `Read`
   - Issue & Event: `Write`
2. **Organization Slugが間違っている** - `.tfvars.local`の`sentry_organization`を確認
3. **Tokenが無効** - Secrets Managerの値を確認：
   ```bash
   aws secretsmanager get-secret-value --secret-id sentry/auth_token --query 'SecretString' --output text
   ```

**エラー: `Error: 403 Forbidden` (Datadog)**

```
Error: 403 Forbidden
  with provider["registry.terraform.io/datadog/datadog"]
```

**原因と対処法**:
1. **Application Keyのスコープ不足** ⚠️ **最も多い原因**
   - Datadog UIで新しいApp Keyを作成し、以下のスコープを付与：
     - `dashboards_read`
     - `dashboards_write`
     - `monitors_read`
     - `monitors_write`
   - Secrets Managerを更新：
     ```bash
     aws secretsmanager update-secret --secret-id datadog/app_key --secret-string 'YOUR_NEW_APP_KEY'
     ```

2. **API Key/App Keyの形式が不正** - 余分なダブルクォートや改行が含まれている：
   ```bash
   # 形式確認
   aws secretsmanager get-secret-value --secret-id datadog/api_key --query 'SecretString' --output text | wc -c  # 33が正常
   aws secretsmanager get-secret-value --secret-id datadog/app_key --query 'SecretString' --output text | wc -c  # 41が正常

   # ダブルクォートを削除
   CURRENT=$(aws secretsmanager get-secret-value --secret-id datadog/api_key --query 'SecretString' --output text)
   CLEAN=$(echo $CURRENT | tr -d '"')
   aws secretsmanager update-secret --secret-id datadog/api_key --secret-string "$CLEAN"
   ```

3. **API Keyが無効** - Datadog UIで新しいAPI Keyを作成

**エラー: `Error: Duplicate data configuration`**

```
Error: Duplicate data "aws_secretsmanager_secret" configuration
  A aws_secretsmanager_secret data resource named "datadog_api_key" was already declared
```

**原因**: `datadog.tf`と`providers.tf`で同じdata sourceを定義している

**対処法**: 最新のコードでは修正済み。キャッシュをクリア：
```bash
cd infra/terraform/envs/staging/monitoring
rm -rf .terragrunt-cache
terragrunt init
```

**エラー: `Error: Missing required argument "teams"`**

```
Error: Missing required argument
  on sentry.tf line 7, in resource "sentry_project" "web":
  The argument "teams" is required, but no definition was found.
```

**原因**: Sentry Providerのバージョンが新しく、`team`から`teams`（配列）に変更された

**対処法**: 最新のコードでは修正済み（`teams = [var.sentry_team]`）

#### ECS/Datadog Agent実行時のエラー

**エラー: Datadog AgentがAPI Keyを取得できない**

**確認コマンド**:
```bash
# ECSタスクログ確認
aws logs tail /ecs/bookmark-manager/staging/web --filter-pattern "datadog" --follow

# IAM権限確認
aws iam get-role-policy \
  --role-name bookmark-manager-staging-ecs-task-execution \
  --policy-name bookmark-manager-staging-ecs-secrets
```

**対処法**: IAM権限が不足している場合、`infra/terraform/modules/security/iam.tf`を確認

### 料金プラン比較

| プラン                        | 月額コスト | 含まれる内容                        |
| ----------------------------- | ---------- | ----------------------------------- |
| **Infrastructure Pro**        | $15/ホスト | インフラ監視、100カスタムメトリクス |
| **Infrastructure Enterprise** | $23/ホスト | Pro + 200カスタムメトリクス         |
| **APM Pro**                   | $31/ホスト | インフラ + APM + トレーシング       |

**staging環境の実際のコスト**:
- ECS 2ホスト（Web + API）: $15 × 2 × 36% = **$10.8/月**
- RDS 1ホスト: $15 × 1 × 100% = **$15/月**
- **合計: $25.8/月**

### 注意事項

1. **Secrets Manager料金**: 以下の3つのシークレットで$1.20/月（各$0.40）
   - `datadog/api_key`: Datadog APIキー（Agent用）
   - `datadog/app_key`: Datadog Appキー（Terraform用）
   - `sentry/auth_token`: Sentry認証トークン（Terraform用）
2. **ホスト停止遅延**: ECS停止後、Datadog課金除外まで最大2時間
3. **High Watermark Plan**: 必ず選択すること（上位1%のスパイク除外）
4. **データ転送料**: Datadog/Sentry APIへの送信は無料（AWS内）
5. **無料トライアル**: Datadog 14日間、機能確認後に本導入判断
6. **Sentry DSN**: 公開情報のためSSM Parameter Storeで管理
7. **Sentry Auth Token**: Terraform実行時のみ必要、Secrets Managerで管理

### セキュリティ設計

| 項目                  | 保存場所                           | 用途                            | アクセス権限                                 |
| --------------------- | ---------------------------------- | ------------------------------- | -------------------------------------------- |
| **Sentry DSN**        | SSM Parameter Store (SecureString) | Next.jsアプリ実行時（公開可能） | ECS Task Execution Role                      |
| **Sentry Auth Token** | Secrets Manager                    | Terraform実行時のみ（機密情報） | Terraform Provider                           |
| **Datadog API Key**   | Secrets Manager                    | Datadog Agent実行時（機密情報） | ECS Task Execution Role + Terraform Provider |
| **Datadog App Key**   | Secrets Manager                    | Terraform実行時のみ（機密情報） | Terraform Provider                           |

**運用の利点**:
- ✅ **環境変数不要**: `export`コマンドを毎回実行する必要なし
- ✅ **自動取得**: Terraformが自動的にSecrets Managerから取得
- ✅ **チーム共有**: AWS IAMでアクセス制御、チーム開発が容易
- ✅ **CI/CD対応**: GitHub ActionsやCodePipelineで簡単に利用可能
- ✅ **セキュア**: ローテーション可能、監査ログ記録

### 関連ファイル

**アプリケーション設定**:
- Next.js Sentry設定: [`src/apps/frontend/web/instrumentation-client.ts`](../../../src/apps/frontend/web/instrumentation-client.ts)
- NestJS Datadog設定: [`src/apps/web-api/core/src/main.ts`](../../../src/apps/web-api/core/src/main.ts)

**Terraform設定**:
- Monitoring Module: [`modules/monitoring/`](../../modules/monitoring/)
  - [`sentry.tf`](../../modules/monitoring/sentry.tf): Sentryプロジェクト・アラート
  - [`datadog.tf`](../../modules/monitoring/datadog.tf): Datadogモニター・ダッシュボード
  - [`providers.tf`](../../modules/monitoring/providers.tf): Sentry/Datadog Provider設定
- Terragrunt設定: [`envs/staging/monitoring/`](monitoring/)
- ローカル設定: [`envs/staging/.tfvars.local`](.tfvars.local)（Gitignore対象）
- サンプル設定: [`envs/staging/.tfvars.local.example`](.tfvars.local.example)

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

別ターミナルで、Bastion EC2経由でRDSへのポートフォワーディングを確立します。

```bash
# 別ターミナルで実行
./scripts/connect_to_awsdb.sh staging 5432

# 以下の情報が表示されます:
# - ホスト: localhost
# - ポート: 5432
# - データベース: bookmarkdb
# - ユーザー名: dbadmin
# - パスワード: (表示されます)
```

**トラブルシューティング**:
- Bastionインスタンスが停止している場合、起動してください
- SSM Session Manager Pluginがインストールされていることを確認してください

#### ステップ3: マイグレーションの実行

ポートフォワーディングが確立したら、元のターミナルでマイグレーションを実行します。

```bash
# .env.stagingを使用してマイグレーション実行
pnpm dotenv -e .env.staging -- prisma migrate deploy \
  --schema=src/libs/prisma/schema.prisma

# シードデータの投入（必要に応じて）
pnpm dotenv -e .env.staging -- prisma db seed \
  --schema=src/libs/prisma/schema.prisma
```

**注意**:
- `migrate deploy`は本番環境用のマイグレーションコマンドで、プロンプトなしで実行されます
- ローカル開発では`migrate dev`を使用しますが、staging/production環境では`migrate deploy`を使用します
- ポートフォワーディングが確立している間のみマイグレーションが可能です

#### ステップ4: マイグレーション確認

```bash
# Prisma Studioでテーブルを確認
pnpm dotenv -e .env.staging -- prisma studio \
  --schema=src/libs/prisma/schema.prisma

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
docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_SENTRY_DSN="https://8145f9f0127b9487fc67e4940fa0e6b8@o4510377330999296.ingest.us.sentry.io/4510380263014400" -f src/apps/frontend/web/Dockerfile -t bookmark-manager-staging-web:latest .
docker tag bookmark-manager-staging-web:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookmark-manager-staging-web:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookmark-manager-staging-web:latest

# APIイメージのビルド＆プッシュ
docker build --platform linux/amd64 -t bookmark-manager-staging-api:latest -f src/apps/web-api/core/Dockerfile .
docker tag bookmark-manager-staging-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookmark-manager-staging-api:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookmark-manager-staging-api:latest
```

### 6. ECS再デプロイ

```bash
aws ecs update-service --cluster bookmark-manager-staging-cluster --service bookmark-manager-staging-web --force-new-deployment --query 'service.{ServiceName:serviceName,Status:status,DesiredCount:desiredCount}'
aws ecs update-service --cluster bookmark-manager-staging-cluster --service bookmark-manager-staging-api --force-new-deployment --query 'service.{ServiceName:serviceName,Status:status,DesiredCount:desiredCount}'
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
| **EC2 Bastion (t3.nano)**         | $0.0052/時間                                   | **$3.7**           | 24時間稼働、DB接続用              |
| **ECS Fargate (Web)**             | vCPU: $0.04656/時間<br>Memory: $0.00511/GB時間 | **$7.5**           | 0.25 vCPU + 0.5 GB、営業時間のみ  |
| **ECS Fargate (API)**             | vCPU: $0.04656/時間<br>Memory: $0.00511/GB時間 | **$7.5**           | 0.25 vCPU + 0.5 GB、営業時間のみ  |
| **ALB**                           | $0.0243/時間 + LCU料金                         | **$17.4**          | 時間料金 + 使用量課金             |
| **VPC Endpoint (Interface × 3)**  | $0.01/時間 × 3                                 | **$21.6**          | ECR API, ECR DKR, CloudWatch Logs |
| **Lambda (ECS Scheduler)**        | リクエスト + 実行時間                          | **$0.05未満**      | 1日2回実行                        |
| **S3**                            | ストレージ + リクエスト                        | **$1-5**           | データ量による                    |
| **CloudWatch Logs**               | 取り込み + 保存                                | **$5-10**          | ログ量による、7日保存             |
| **その他**                        | データ転送、ECR等                              | **$1-5**           | -                                 |

**合計: 約$63-74/月**（営業時間のみ稼働）

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
