# ============================================================
# Monitoring Configuration (Datadog + Sentry) - Production
# ============================================================

include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

# ローカル設定ファイルを読み込み（.tfvars.local）
# ファイルが存在しない場合は.tfvars.local.exampleにフォールバック
include "local" {
  path           = find_in_parent_folders(".tfvars.local", find_in_parent_folders(".tfvars.local.example"))
  expose         = true
  merge_strategy = "deep"
}

terraform {
  source = "../../../modules/monitoring"
}

inputs = {
  tags = {
    Service = "monitoring"
  }
}

# 注意:
# - sentry_organization, sentry_team, alert_email は .tfvars.local で定義
# - .tfvars.local.example をコピーして .tfvars.local を作成してください
# - SENTRY_AUTH_TOKEN は環境変数で設定してください
