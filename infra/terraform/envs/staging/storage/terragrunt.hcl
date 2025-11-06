# ============================================================
# Storage Module Configuration for Staging
# ============================================================
# S3バケット（静的アセット配信用）を構築します。

# ルート設定の継承
include "root" {
  path = find_in_parent_folders("root.hcl")
}

# 親環境設定の継承
include "env" {
  path = find_in_parent_folders("env.hcl")
}

# Terraformモジュールのソースパス
terraform {
  source = "../../../modules/storage"
}

# モジュール固有の変数
inputs = {
  # S3バケット設定（コスト最適化）
  enable_versioning = false # staging環境ではバージョニング無効

  # ライフサイクルルール（古いファイルの自動削除）
  lifecycle_rules = {
    transition_to_ia_days = 90  # 90日後にInfrequent Access移行
    expiration_days       = 365 # 365日後に削除
  }

  # CORS設定（staging環境では全開放）
  cors_allowed_origins = ["*"] # TODO: 本番環境では具体的なドメインを指定
}
