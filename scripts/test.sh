#!/bin/bash
# 全テスト実行（Testing Trophy）スクリプト

cd "$(dirname "$0")/.."

# Static
chmod +x scripts/lint_and_format.sh
sh scripts/lint_and_format.sh

# Unit & Integration
pnpm exec nx run api-core:test
pnpm nx run web:test

# E2E
pnpm nx run web:test:e2e

# API性能テスト準備
# Docker起動チェック
if ! docker ps --format "table {{.Names}}" | grep -q "db_main\|db_logs"; then
  echo "Starting Docker containers..."
  # Docker起動
  docker-compose -f infra/docker/docker-compose.yml up -d
else
  echo "Docker containers already running, skipping..."
fi

pnpm nx run api-core:serve:development &
API_PID=$!
echo "API server started with PID: $API_PID"

# サービスが起動するまで待機
echo "Waiting for API server to start..."
sleep 15

# API Performance
k6 run src/apps/web-api/core/test/performance/samples.js

# 実行中のAPIサーバーを終了
echo "Stopping API server with PID: $API_PID"
kill $API_PID
wait $API_PID 2>/dev/null
echo "API server stopped."

