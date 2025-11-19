# ============================================================
# Next.js Application Dockerfile (Nx Monorepo)
# ============================================================
# マルチステージビルドでイメージサイズを最小化

# ベースイメージ
FROM node:22.15.0-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 依存関係のインストール
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# postinstallスクリプトに必要なPrismaスキーマをコピー
COPY src/libs/prisma ./src/libs/prisma
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ビルドステージ
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ビルド引数の定義（Sentry DSN）
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}

# Nx環境変数の設定
ENV NX_DAEMON=false

# Webアプリのビルド
RUN corepack enable pnpm && \
  pnpm nx build web --prod

# 本番実行ステージ
FROM base AS runner
# NODE_ENVは実行時に環境変数で設定（staging, productionなど）
ENV PORT=3000

# 非rootユーザーの作成
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

# Next.jsのstandalone出力をコピー
# Nxビルドの場合、出力は src/apps/frontend/web/.next に配置される
COPY --from=builder --chown=nextjs:nodejs /app/src/apps/frontend/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/src/apps/frontend/web/.next/static ./src/apps/frontend/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/apps/frontend/web/public ./src/apps/frontend/web/public

USER nextjs

EXPOSE 3000

# standalone出力のserver.jsを実行
CMD ["node", "src/apps/frontend/web/server.js"]
