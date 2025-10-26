#!/bin/bash
# ローカル開発環境の疎通確認用スクリプト

cd "$(dirname "$0")/.."

# Nxキャッシュクリア
pnpm nx reset

# Docker起動チェック
if ! docker ps --format "table {{.Names}}" | grep -q "db_main\|db_logs"; then
  echo "Starting Docker containers..."
  # Docker起動
  docker-compose -f infra/docker/docker-compose.yml up -d
else
  echo "Docker containers already running, skipping..."
fi

# NestJS開発サーバー（バックグラウンド）
pnpm nx run api-core:serve:development &

# Next.js開発サーバー
pnpm nx run web:dev
