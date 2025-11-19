# ============================================================
# Monitoring Configuration (Datadog + Sentry)
# ============================================================
# DatadogとSentryを使用したモニタリング設定
# - Sentry: Next.jsのエラー監視（無料枠）
# - Datadog: ECS + RDS監視（有料プラン）

# ルート設定読み込み
include "root" {
  path = find_in_parent_folders("root.hcl")
}

# 環境設定読み込み
include "env" {
  path = find_in_parent_folders("env.hcl")
}

# ローカル設定ファイルを読み込み（.tfvars.local）
include "local" {
  path           = find_in_parent_folders(".tfvars.local")
  expose         = true
  merge_strategy = "deep"
}

# モジュールソース指定
terraform {
  source = "../../../modules/monitoring"
}

# 依存関係: compute モジュールが先に作成される必要がある
# dependency "compute" {
#   config_path = "../compute"
# }

# モジュール固有の入力変数
inputs = {
  # タグ設定（env.hclから自動的にマージされる）
  tags = {
    Service = "monitoring"
  }
}

# 注意:
# - sentry_organization, sentry_team, alert_email は .tfvars.local で定義
# - .tfvars.local.example をコピーして .tfvars.local を作成してください
# - SENTRY_AUTH_TOKEN は環境変数で設定してください
