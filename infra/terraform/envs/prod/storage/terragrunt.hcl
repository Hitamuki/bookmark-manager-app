# ============================================================
# Storage Module Configuration for Production
# ============================================================

include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

terraform {
  source = "../../../modules/storage"
}

inputs = {
  # S3バケット設定（本番環境）
  enable_versioning = true

  # ライフサイクルルール
  lifecycle_rules = {
    transition_to_ia_days = 180
    expiration_days       = 730
  }

  # CORS設定（本番環境では具体的なドメイン指定）
  # TODO: ドメイン名は将来的に tidilyhub.app に変更する可能性あり
  cors_allowed_origins = [
    "https://tidilyspace.app",
    "https://www.tidilyspace.app"
  ]
}
