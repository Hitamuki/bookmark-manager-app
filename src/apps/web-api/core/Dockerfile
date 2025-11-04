# ============================================================
# NestJS API Dockerfile (Nx Monorepo)
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

# Prisma Client生成
RUN corepack enable pnpm && \
    pnpm prisma generate --schema=src/libs/prisma/schema.prisma

# APIのビルド
RUN pnpm nx build api-core --prod

# 本番実行ステージ
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001

# 非rootユーザーの作成
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# 必要なファイルのみコピー
COPY --from=builder /app/dist/src/apps/web-api/core ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/libs/prisma ./src/libs/prisma

# 権限設定
RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3001

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "main.js"]
