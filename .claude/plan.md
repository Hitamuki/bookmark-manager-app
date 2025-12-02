# Preview環境構築計画（完全無料構成）

## 構成概要

**完全無料のプラットフォーム構成**:
- **Web (Next.js)**: Vercel 無料プラン
- **API (NestJS)**: Fly.io 無料プラン（$5/月クレジット内）
- **DB (PostgreSQL)**: Supabase 無料プラン
- **DB (MongoDB)**: MongoDB Atlas 無料プラン
- **月額コスト**: $0

## 5日間の実装スケジュール

### Day 1: 環境準備（1.5時間）

#### 1.1 `.env.preview`作成（30分）
```bash
# ファイル作成
touch .env.preview

# 内容（テンプレート）
NODE_ENV=preview
ENVIRONMENT=preview
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
MONGODB_URI="mongodb+srv://bookmark_preview:[PASSWORD]@bookmark-manager-preview.mongodb.net/?appName=bookmark-manager-preview"
PORT=3001
API_URL=https://bookmark-api-preview.fly.dev
ALLOWED_ORIGINS=https://bookmark-manager-preview.vercel.app,http://localhost:3000
DD_ENV=preview
DD_SERVICE=bookmark-api-preview
DD_VERSION=1.0.0
DD_API_KEY=[DATADOG_API_KEY]
DD_SITE=ap1.datadoghq.com
SENTRY_DSN=[SENTRY_DSN]
SENTRY_AUTH_TOKEN=[SENTRY_AUTH_TOKEN]
NEXT_PUBLIC_SENTRY_DSN=[SENTRY_DSN]
SENTRY_ENVIRONMENT=preview
NEXT_PUBLIC_API_MOCKING=disabled
CHROMATIC_PROJECT_TOKEN=[既存トークン]
```

#### 1.2 Supabaseプロジェクト作成（30分）
1. https://supabase.com でサインアップ
2. `New Project`
3. 設定:
   - Name: `bookmark-manager-preview`
   - Password: 強力なパスワード（保存必須）
   - Region: Northeast Asia (Tokyo)
   - Plan: Free
4. Settings → Database → Connection string をコピー
5. `.env.preview`に接続情報を記載

#### 1.3 MongoDB Atlas設定（30分）
1. https://cloud.mongodb.com でサインアップ
2. Create Cluster → Free（M0 Sandbox）
3. Database Access: `bookmark_preview`ユーザー作成
4. Network Access: `0.0.0.0/0`追加
5. Connect → Connection string をコピー
6. `.env.preview`に接続情報を記載

---

### Day 2: GitHub Actions実装（4.5時間）

#### 2.1 セキュリティスキャンワークフロー作成（2時間）

**ファイル**: `.github/workflows/security-scan-preview.yml`

```yaml
name: Security Scan (Preview Environment)

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 17 * * *'

permissions:
  contents: read
  security-events: write
  pull-requests: write

jobs:
  dependency-scan:
    name: Dependency Vulnerability Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: '10.20.0'
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run npm audit
        run: pnpm audit --audit-level=high
        continue-on-error: true
      - name: Run Snyk scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      - name: Run Trivy scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: './src/apps/web-api/core'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  code-scan:
    name: Static Code Analysis
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript,typescript
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  secrets-scan:
    name: Secret Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run GitLeaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**必要な作業**:
1. https://snyk.io でアカウント作成
2. API Token取得
3. GitHub Settings → Secrets → `SNYK_TOKEN`追加

#### 2.2 Lighthouseワークフロー作成（1時間）

**ファイル**: `.github/workflows/lighthouse-preview.yml`

```yaml
name: Lighthouse Performance Test (Preview)

on:
  push:
    branches: [main]
    paths: ['src/apps/frontend/web/**']
  pull_request:
    branches: [main]
    paths: ['src/apps/frontend/web/**']
  workflow_dispatch:

jobs:
  lighthouse:
    name: Run Lighthouse CI
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Wait for Vercel Preview Deployment
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        id: wait-for-vercel
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            ${{ steps.wait-for-vercel.outputs.url }}
          uploadArtifacts: true
          temporaryPublicStorage: true
          runs: 3
      - name: Comment PR with scores
        uses: actions/github-script@v7
        if: github.event_name == 'pull_request'
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('.lighthouseci/manifest.json'));
            const summary = results[0].summary;
            const comment = `## 🚦 Lighthouse Performance Report\n\n` +
              `| Metric | Score |\n|--------|-------|\n` +
              `| Performance | ${(summary.performance * 100).toFixed(0)}% |\n` +
              `| Accessibility | ${(summary.accessibility * 100).toFixed(0)}% |\n` +
              `| Best Practices | ${(summary['best-practices'] * 100).toFixed(0)}% |\n` +
              `| SEO | ${(summary.seo * 100).toFixed(0)}% |\n`;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

#### 2.3 DBマイグレーションワークフロー作成（1.5時間）

**ファイル**: `.github/workflows/db-migration-preview.yml`

```yaml
name: Database Migration (Preview - Supabase)

on:
  push:
    branches: [main]
    paths:
      - 'src/libs/prisma/migrations/**'
      - 'src/libs/prisma/schema.prisma'
  workflow_dispatch:

jobs:
  migrate:
    name: Run Prisma Migrations
    runs-on: ubuntu-latest
    environment: preview

    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Run Prisma Migrations
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DIRECT_DATABASE_URL }}
        run: |
          pnpm prisma migrate deploy --schema=src/libs/prisma/schema.prisma
      - name: Check Migration Status
        env:
          DATABASE_URL: ${{ secrets.SUPABASE_DIRECT_DATABASE_URL }}
        run: |
          pnpm prisma migrate status --schema=src/libs/prisma/schema.prisma
      - name: Generate Prisma Client
        run: |
          pnpm prisma generate --schema=src/libs/prisma/schema.prisma
```

**GitHub Secrets追加**:
- Settings → Secrets and variables → Actions
- `SUPABASE_DIRECT_DATABASE_URL`追加

---

### Day 3: Fly.io/Vercelセットアップ（3時間）

#### 3.1 Fly.ioセットアップ（1.5時間）

**前提条件**:
```bash
# Fly.io CLIインストール（macOS）
brew install flyctl

# ログイン
flyctl auth login

# 無料クレジット確認（$5/月）
flyctl dashboard
```

**アプリ作成**:
```bash
cd src/apps/web-api/core

# Fly.ioアプリ初期化
flyctl launch --no-deploy

# 対話プロンプト:
# - App Name: bookmark-api-preview
# - Region: Tokyo (nrt)
# - Postgres: No（Supabase使用）
# - Redis: No
```

**fly.toml作成** (プロジェクトルート):
```toml
app = "bookmark-api-preview"
primary_region = "nrt"

[build]
  [build.args]
    NODE_ENV = "production"

[env]
  NODE_ENV = "production"
  ENVIRONMENT = "preview"
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "off"
  auto_start_machines = true
  min_machines_running = 1

  [[http_service.checks]]
    interval = "15s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/api/health"

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1

[metrics]
  port = 9091
  path = "/metrics"
```

**環境変数設定**:
```bash
flyctl secrets set DATABASE_URL="[Supabase Pooling URL]"
flyctl secrets set DIRECT_DATABASE_URL="[Supabase Direct URL]"
flyctl secrets set MONGODB_URI="[MongoDB Atlas URI]"
flyctl secrets set ALLOWED_ORIGINS="https://bookmark-manager-preview.vercel.app,http://localhost:3000"
flyctl secrets set DD_API_KEY="[DATADOG_API_KEY]"
flyctl secrets set DD_ENV="preview"
flyctl secrets set DD_SERVICE="bookmark-api-preview"
flyctl secrets set DD_VERSION="1.0.0"
flyctl secrets set DD_SITE="ap1.datadoghq.com"
flyctl secrets set SENTRY_DSN="[SENTRY_DSN]"
flyctl secrets set SENTRY_AUTH_TOKEN="[SENTRY_AUTH_TOKEN]"
flyctl secrets set SENTRY_ENVIRONMENT="preview"
```

**Dockerfile作成** (`src/apps/web-api/core/Dockerfile.fly`):
```dockerfile
FROM node:22.15.0-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && \
    pnpm prisma generate --schema=src/libs/prisma/schema.prisma && \
    pnpm nx build api-core --prod

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs
USER nestjs
COPY --from=builder --chown=nestjs:nestjs /app/dist/src/apps/web-api/core ./
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
EXPOSE 8080
ENV PORT=8080
CMD ["node", "main.js"]
```

**デプロイ**:
```bash
flyctl deploy --config fly.toml --dockerfile src/apps/web-api/core/Dockerfile.fly
```

#### 3.2 Vercelセットアップ（1.5時間）

1. https://vercel.com でサインアップ
2. `Add New` → `Project`
3. GitHubリポジトリ連携: `bookmark-manager-app`
4. 設定:
   - Framework: Next.js
   - Root Directory: `src/apps/frontend/web`
   - Build Command: `cd ../../../ && pnpm nx build web --prod`
   - Output Directory: `.next`
   - Install Command: `cd ../../../ && pnpm install --frozen-lockfile`

**環境変数** (Settings → Environment Variables):
```
API_URL=https://bookmark-api-preview.fly.dev
NEXT_PUBLIC_API_MOCKING=disabled
NEXT_PUBLIC_SENTRY_DSN=[値]
SENTRY_AUTH_TOKEN=[Secret]
SENTRY_ENVIRONMENT=preview
NODE_ENV=production
ENVIRONMENT=preview
```

5. `Deploy`ボタンクリック

---

### Day 4: データベース・統合テスト（3時間）

#### 4.1 Supabaseマイグレーション実行（1時間）

```bash
# 環境変数設定
export DATABASE_URL="[Supabase Direct URL]"

# マイグレーション実行
pnpm prisma migrate deploy --schema=src/libs/prisma/schema.prisma

# 状態確認
pnpm prisma migrate status --schema=src/libs/prisma/schema.prisma

# Prisma Studioでデータ確認
pnpm prisma studio --schema=src/libs/prisma/schema.prisma

# シード実行（オプション）
pnpm prisma db seed
```

#### 4.2 統合テスト（2時間）

**APIテスト**:
```bash
# ヘルスチェック
curl https://bookmark-api-preview.fly.dev/api/health

# サンプルAPI（REST Clientまたはcurl）
curl https://bookmark-api-preview.fly.dev/api/samples
```

**Vercel → Fly.io → Supabase接続確認**:
1. https://bookmark-manager-preview.vercel.app にアクセス
2. ブラウザDevToolsでネットワーク確認
3. APIリクエスト → Fly.io → Supabaseの流れを確認

**エラーログ確認**:
```bash
# Fly.ioログ
flyctl logs

# MongoDB Atlasログ
# https://cloud.mongodb.com → Cluster → Metrics → Logs
```

---

### Day 5: モニタリング・ドキュメント（3.5時間）

#### 5.1 モニタリング確認（1.5時間）

**Datadog APM**:
1. https://app.datadoghq.com にアクセス
2. APM → Services → `bookmark-api-preview`確認
3. トレース確認

**Sentry**:
1. https://sentry.io にアクセス
2. Projects → bookmark-manager-preview
3. エラートラッキング確認

**Lighthouseスコア**:
1. GitHub Actions → Lighthouse workflow確認
2. Performance 90%以上目標

#### 5.2 ドキュメント作成（2時間）

**作成ファイル**:
1. `infra/preview/README.md` - Preview環境詳細ドキュメント
2. `.env.preview.template` - 環境変数テンプレート
3. `README.md`更新 - 環境一覧表追加

---

## アプリケーション設定の調整

### next.config.js修正

**ファイル**: `src/apps/frontend/web/next.config.js`

```javascript
const { composePlugins, withNx } = require('@nx/next');
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  nx: {
    svgr: false,
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },

  // Vercel環境では'standalone'不要
  output: process.env.VERCEL ? undefined : 'standalone',

  async rewrites() {
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  // Vercel最適化
  ...(process.env.VERCEL && {
    images: {
      domains: ['bookmark-api-preview.fly.dev'],
    },
  }),
};

const plugins = [withNx];

const sentryWebpackPluginOptions = {
  silent: true,
  hideSourceMaps: true,
  widenClientFileUpload: true,
};

module.exports = withSentryConfig(composePlugins(...plugins)(nextConfig), sentryWebpackPluginOptions);
```

### main.ts修正

**ファイル**: `src/apps/web-api/core/src/main.ts`

**Datadog初期化部分**:
```typescript
const environment = process.env.NODE_ENV || 'development';
const envName = process.env.ENVIRONMENT || environment;
const isProduction = environment === 'production' && envName === 'prod';
const isStaging = environment === 'staging' || envName === 'staging';
const isPreview = envName === 'preview';

tracer.init({
  env: process.env.DD_ENV || envName,
  service: process.env.DD_SERVICE || 'bookmark-api',
  version: process.env.DD_VERSION || '1.0.0',
  sampleRate: isProduction ? 0.2 : isStaging ? 0.05 : isPreview ? 0.03 : 1.0,
  rateLimit: isProduction ? 50 : isStaging ? 10 : isPreview ? 5 : 100,
  logInjection: true,
  profiling: isProduction,
  runtimeMetrics: isProduction,
});
```

**bootstrap関数**:
```typescript
async function bootstrap() {
  // ... 既存コード ...

  const port = process.env.PORT || 4000;
  // Fly.ioでは0.0.0.0でリッスン
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
```

---

## チェックリスト

- [ ] `.env.preview`作成完了
- [ ] Supabaseプロジェクト作成・接続確認
- [ ] MongoDB Atlas設定完了
- [ ] Fly.ioアプリデプロイ成功
- [ ] Vercelプロジェクトデプロイ成功
- [ ] GitHub Actionsワークフロー3つ動作確認
- [ ] Prismaマイグレーション実行完了
- [ ] Vercel→Fly.io→Supabase接続確認
- [ ] Datadog APMトレース確認
- [ ] Sentryエラートラッキング確認
- [ ] MongoDB Atlasログ確認
- [ ] Lighthouseスコア90%以上達成
- [ ] セキュリティスキャン全通過
- [ ] ドキュメント更新完了

---

## トラブルシューティング

### Fly.io関連

**問題**: デプロイ失敗
- `flyctl logs`でエラー確認
- Dockerfile.flyのパス確認
- `flyctl deploy --verbose`で詳細ログ

**問題**: ヘルスチェック失敗
- `/api/health`エンドポイント確認
- `main.ts`で`app.listen('0.0.0.0')`設定確認
- fly.tomlのhealth check設定確認

**問題**: 無料枠超過
- `flyctl dashboard`で使用量確認
- メモリ256MB、CPU shared 1で運用
- auto_stop_machines = "off"で常時稼働

### Vercel関連

**問題**: ビルドエラー
- Install Commandのパス確認（`cd ../../../`）
- Build Commandのパス確認
- Node.jsバージョン確認（22系）

### Supabase関連

**問題**: マイグレーション失敗
- Direct URL使用確認（PgBouncer経由NG）
- ポート5432確認
- パスワードのURLエンコード確認

---

## 次のステップ

Day 1から順次実装を開始してください。各フェーズ完了後に動作確認を行い、問題があれば調整します。

詳細な構成ドキュメントは`infra/preview/README.md`を参照してください。
