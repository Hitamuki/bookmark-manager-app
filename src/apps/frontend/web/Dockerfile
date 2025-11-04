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
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# ビルドステージ
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Nx環境変数の設定
ENV NX_DAEMON=false

# Webアプリのビルド
RUN corepack enable pnpm && \
    pnpm nx build web --prod

# 本番実行ステージ
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# 非rootユーザーの作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 必要なファイルのみコピー
COPY --from=builder /app/dist/src/apps/frontend/web/.next/standalone ./
COPY --from=builder /app/dist/src/apps/frontend/web/.next/static ./dist/src/apps/frontend/web/.next/static
COPY --from=builder /app/dist/src/apps/frontend/web/public ./dist/src/apps/frontend/web/public

# 権限設定
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "dist/src/apps/frontend/web/server.js"]
