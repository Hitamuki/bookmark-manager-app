# Preview環境 構成ドキュメント

## 概要

Preview環境は、商用利用前の評価・テスト用環境として、完全無料のクラウドサービスで構成されています。

### 技術スタック

| コンポーネント      | サービス         | プラン                | 月額コスト |
| ------------------- | ---------------- | --------------------- | ---------- |
| **Web (Frontend)**  | Vercel           | Hobby (無料)          | $0         |
| **API (Backend)**   | Fly.io           | Free ($5クレジット内) | $0         |
| **DB (PostgreSQL)** | Supabase         | Free                  | $0         |
| **DB (MongoDB)**    | MongoDB Atlas    | Free (M0 512MB)       | $0         |
| **モニタリング**    | Datadog + Sentry | 既存                  | $0         |
| **合計**            | -                | -                     | **$0**     |

---

## アーキテクチャ図

```txt
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Vercel (Next.js SSR)               │
│  - bookmark-manager-preview         │
│  - Region: Global Edge              │
│  - Auto Deploy on Push              │
└──────────┬──────────────────────────┘
           │ HTTPS
           ▼
┌─────────────────────────────────────┐
│  Fly.io (NestJS API)                │
│  - bookmark-api-preview             │
│  - Region: Tokyo (nrt)              │
│  - Memory: 256MB, CPU: Shared 1     │
│  - Auto Scale: Min 1 Machine        │
└──────────┬──────────────────────────┘
           │
           ├─────────────┐
           │             │
           ▼             ▼
┌──────────────────┐  ┌──────────────────┐
│  Supabase        │  │  MongoDB Atlas   │
│  PostgreSQL 15   │  │  MongoDB 8.0     │
│  Region: Tokyo   │  │  Region: Tokyo   │
│  Storage: 500MB  │  │  Storage: 512MB  │
└──────────────────┘  └──────────────────┘
```

---

## 環境情報

### URL

| サービス       | URL                                             | 用途            |
| -------------- | ----------------------------------------------- | --------------- |
| **Web**        | https://bookmark-manager-preview.vercel.app     | フロントエンド  |
| **API**        | https://bookmark-api-preview.fly.dev            | バックエンドAPI |
| **API Health** | https://bookmark-api-preview.fly.dev/api/health | ヘルスチェック  |

### リソース制限

#### Vercel (Hobby Plan)

- **帯域幅**: 100GB/月
- **ビルド時間**: 100時間/月
- **関数実行時間**: 100GB-時間/月
- **Edge Functions**: 500,000リクエスト/月
- **デプロイ数**: 無制限
- **チームメンバー**: 1名
- **カスタムドメイン**: 無料

#### Fly.io (Free Plan)

- **リソース**: 最大3台の共有CPU-1x、256MBマシン
- **無料クレジット**: $5/月（約2,160時間稼働可能）
- **永続ボリューム**: 3GB
- **帯域幅**: 100GB/月（外部送信）
- **IPv4アドレス**: $2/月（IPv6は無料）※今回はIPv6のみ使用
- **リージョン**: 1リージョン推奨

#### Supabase (Free Plan)

- **Database**: 500MB
- **File Storage**: 1GB
- **Monthly Active Users**: 無制限
- **Edge Functions**: 500,000リクエスト/月
- **Realtime**: 200同時接続
- **Bandwidth**: 5GB/月
- **一時停止**: 1週間非アクティブで自動停止（再アクティブ化可能）

#### MongoDB Atlas (M0 Free)

- **Storage**: 512MB
- **RAM**: Shared
- **Clusters**: 1個
- **Connections**: 500同時接続
- **バックアップ**: なし（手動エクスポート必要）
- **リージョン**: 1リージョン

---

## 環境変数

### Vercel環境変数

Settings → Environment Variables で設定。

```bash
# API接続
API_URL=https://bookmark-api-preview.fly.dev

# アプリケーションURL（ログ出力用）
NEXT_PUBLIC_APP_URL=https://bookmark-manager-preview.vercel.app

# 機能フラグ
NEXT_PUBLIC_API_MOCKING=disabled

# モニタリング
NEXT_PUBLIC_SENTRY_DSN=[SENTRY_DSN]
SENTRY_AUTH_TOKEN=[Secret]
SENTRY_ENVIRONMENT=preview

# 環境設定
NODE_ENV=production
ENVIRONMENT=preview
```

### Fly.io Secrets

`flyctl secrets set`で設定。

```bash
# Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
MONGODB_URI="mongodb+srv://bookmark_preview:[PASSWORD]@bookmark-manager-preview.mongodb.net/?appName=bookmark-manager-preview"

# Security
ALLOWED_ORIGINS="https://bookmark-manager-preview.vercel.app,http://localhost:3000"

# Application URL（ログ出力用）
PUBLIC_URL="https://bookmark-api-preview.fly.dev/api"

# Monitoring
DD_ENV=preview
DD_SERVICE=bookmark-api-preview
DD_VERSION=1.0.0
DD_API_KEY=[DATADOG_API_KEY]
DD_SITE=ap1.datadoghq.com
SENTRY_DSN=[SENTRY_DSN]
SENTRY_AUTH_TOKEN=[SENTRY_AUTH_TOKEN]
SENTRY_ENVIRONMENT=preview
```

---

## デプロイ方法

### 初回デプロイ

#### 1. Fly.ioデプロイ

```bash
# Fly.io CLIインストール（未インストールの場合）
brew install flyctl

# ログイン
flyctl auth login

# プロジェクトルートから実行
cd /path/to/bookmark-manager-app

# デプロイ
flyctl deploy --config fly.toml --dockerfile src/apps/web-api/core/Dockerfile.fly
```

#### 2. Vercelデプロイ

1. https://vercel.com でGitHubリポジトリ連携
2. プロジェクト設定（`.claude/plan.md`参照）
3. `Deploy`ボタンクリック
4. 自動デプロイ完了

### 更新デプロイ

#### Fly.io (手動)

```bash
# mainブランチにプッシュ後
flyctl deploy
```

**自動デプロイ化（GitHub Actions）**:

```yaml
# .github/workflows/deploy-fly-preview.yml
name: Deploy to Fly.io (Preview)

on:
  push:
    branches: [main]
    paths:
      - 'src/apps/web-api/core/**'
      - 'src/libs/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

#### Vercel (自動)

- `main`ブランチへのpushで自動デプロイ
- PRごとにPreview URLが自動生成

---

## データベース管理

### Prismaマイグレーション

#### ローカル実行

```bash
# 環境変数設定
export DATABASE_URL="[Supabase Direct URL]"

# マイグレーション作成
pnpm prisma migrate dev --name "add_new_table" --schema=src/libs/prisma/schema.prisma

# マイグレーション適用
pnpm prisma migrate deploy --schema=src/libs/prisma/schema.prisma

# 状態確認
pnpm prisma migrate status --schema=src/libs/prisma/schema.prisma

# Prisma Studio（データ確認）
pnpm prisma studio --schema=src/libs/prisma/schema.prisma
```

#### GitHub Actions自動実行

`.github/workflows/db-migration-preview.yml`により、以下のタイミングで自動実行。

- `src/libs/prisma/migrations/**`の変更時
- `src/libs/prisma/schema.prisma`の変更時

### MongoDB管理

**接続方法**:

```bash
# MongoDB Compass
mongodb+srv://bookmark_preview:[PASSWORD]@bookmark-manager-preview.mongodb.net/

# mongosh (CLI)
mongosh "mongodb+srv://bookmark-manager-preview.mongodb.net/" --username bookmark_preview
```

**コレクション**:

- `app_logs`: アプリケーションログ（Winstonから自動挿入）

---

## モニタリング・ログ

### Datadog

**APMトレース**:

1. https://app.datadoghq.com にログイン
2. APM → Services → `bookmark-api-preview`
3. トレース・メトリクス確認

**設定**:

- サンプリング率: 3%
- レート制限: 5スパン/秒
- プロファイリング: 無効
- ランタイムメトリクス: 無効

### Sentry

**エラートラッキング**:

1. https://sentry.io にログイン
2. Projects → bookmark-manager-preview
3. Issues確認

**設定**:

- Environment: `preview`
- Source Maps: アップロード有効
- Release Tracking: 有効

### Fly.ioログ

```bash
# リアルタイムログ
flyctl logs

# 過去のログ
flyctl logs --app bookmark-api-preview

# 特定期間のログ
flyctl logs --since 1h
```

### Vercelログ

1. https://vercel.com でプロジェクト選択
2. Deployments → 該当デプロイ → Functions
3. ログ確認

---

## パフォーマンス最適化

### Vercel (Next.js)

- **Edge Runtime**: 可能な限りEdge Functionsを使用
- **ISR (Incremental Static Regeneration)**: 静的ページの自動更新
- **Image Optimization**: 自動WebP変換・遅延読み込み
- **Code Splitting**: 自動的にページ単位で分割

### Fly.io (NestJS)

- **Auto Stop/Start**: 無効（常時稼働）
- **ヘルスチェック**: 15秒間隔で監視
- **メモリ**: 256MB（コスト0）
- **CPU**: Shared 1（コスト0）

### Supabase

- **Connection Pooling**: PgBouncer有効（最大100接続）
- **Indexes**: 頻繁にクエリされるカラムにインデックス作成
- **RLS (Row Level Security)**: 必要に応じて設定

---

## セキュリティ

### CORS設定

**NestJS (`main.ts`)**:

```typescript
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});
```

### 環境変数管理

- **機密情報**: Fly.io Secrets、Vercel環境変数で暗号化保存
- **公開情報**: `.env.preview.template`でテンプレート管理
- **バージョン管理**: `.env.preview`は`.gitignore`で除外

### GitHub Actions Secrets

必要なシークレット。

- `SNYK_TOKEN`: Snykセキュリティスキャン
- `SUPABASE_DIRECT_DATABASE_URL`: DBマイグレーション
- `FLY_API_TOKEN`: Fly.ioデプロイ（自動化する場合）

---

## トラブルシューティング

### Fly.io関連

#### デプロイ失敗

**問題**: `Error: failed to fetch an image or build from source`

**解決**:

```bash
# Dockerfileパス確認
flyctl deploy --dockerfile src/apps/web-api/core/Dockerfile.fly

# ビルドログ確認
flyctl deploy --verbose

# ローカルでDockerビルドテスト
docker build -f src/apps/web-api/core/Dockerfile.fly .
```

#### ヘルスチェック失敗

**問題**: Health check never passed

**解決**:

1. `/api/health`エンドポイント確認
2. `main.ts`で`app.listen('0.0.0.0')`設定確認
3. `fly.toml`のhealth check設定確認

```bash
# ヘルスチェック手動確認
curl https://bookmark-api-preview.fly.dev/api/health
```

#### メモリ不足

**問題**: OOMKilled

**解決**:

```toml
# fly.tomlでメモリ増加（有料）
[[vm]]
  memory = "512mb"  # 256mb → 512mb
```

### Vercel関連

#### ビルドエラー

**問題**: `Module not found` during build

**解決**:

1. Install Commandのパス確認
2. `cd ../../../ && pnpm install --frozen-lockfile`
3. Root Directory確認: `src/apps/frontend/web`

#### API接続エラー

**問題**: CORS error or API unreachable

**解決**:

1. 環境変数`API_URL`確認
2. Fly.ioの`ALLOWED_ORIGINS`確認
3. Fly.ioのヘルスチェック確認

### Supabase関連

#### マイグレーション失敗

**問題**: `Error: Migration failed`

**解決**:

1. Direct URL使用確認（ポート5432）
2. PgBouncerではマイグレーション実行不可
3. パスワードのURLエンコード確認

```bash
# URLエンコード例
# パスワード: abc#123
# エンコード: abc%23123
```

#### 接続制限

**問題**: Too many connections

**解決**:

- Connection Pooling URL使用（ポート6543）
- 最大100接続まで

### MongoDB Atlas関連

#### 接続失敗

**問題**: `MongoNetworkError: failed to connect`

**解決**:

1. Network Access確認（`0.0.0.0/0`許可）
2. Database Access確認（ユーザー権限）
3. 接続文字列確認

---

## コスト管理

### 無料枠の監視

#### Vercel

```bash
# ダッシュボードで確認
https://vercel.com/[your-team]/settings/usage
```

- 帯域幅: 100GB/月
- ビルド時間: 100時間/月
- 超過時: 自動的にHobbyプランからProプラン($20/月)へ移行の提案

#### Fly.io

```bash
# 使用量確認
flyctl dashboard

# 請求情報
https://fly.io/dashboard/personal/billing
```

- 無料クレジット: $5/月
- メモリ256MB、CPU shared 1で運用すると約2,160時間稼働可能
- 超過時: クレジットカード請求

#### Supabase

```bash
# ダッシュボード
https://app.supabase.com/project/[project-id]/settings/billing
```

- Database: 500MB
- 1週間非アクティブで自動停止（再アクティブ化無料）

#### MongoDB Atlas

```bash
# ダッシュボード
https://cloud.mongodb.com/v2/[org-id]#/billing/overview
```

- Storage: 512MB
- M0 Freeは永続無料

---

## バックアップ・復旧

### Supabase

**自動バックアップ**: なし（無料プランでは提供されない）

**手動バックアップ**:

```bash
# pg_dumpでエクスポート
export PGPASSWORD="[PASSWORD]"
pg_dump -h aws-0-ap-northeast-1.pooler.supabase.com \
  -p 5432 \
  -U postgres.[PROJECT-REF] \
  -d postgres \
  -F c \
  -f backup-$(date +%Y%m%d).dump
```

### MongoDB Atlas

**手動バックアップ**:

```bash
# mongodumpでエクスポート
mongodump --uri="mongodb+srv://bookmark_preview:[PASSWORD]@bookmark-manager-preview.mongodb.net/" \
  --out=backup-$(date +%Y%m%d)
```

---

## 環境削除手順

Preview環境を削除する場合。

### 1. Fly.ioアプリ削除

```bash
flyctl apps destroy bookmark-api-preview
```

### 2. Vercelプロジェクト削除

1. https://vercel.com でプロジェクト選択
2. Settings → General → Delete Project

### 3. Supabaseプロジェクト削除

1. https://app.supabase.com でプロジェクト選択
2. Settings → General → Delete Project

### 4. MongoDB Atlasクラスター削除

1. https://cloud.mongodb.com でクラスター選択
2. ... → Terminate

---

## 関連リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Fly.io Documentation](https://fly.io/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## サポート

問題が発生した場合。

1. このドキュメントのトラブルシューティングセクション確認
2. `.claude/plan.md`の実装手順確認
3. 各サービスの公式ドキュメント参照
4. GitHub Issuesで問題を報告
