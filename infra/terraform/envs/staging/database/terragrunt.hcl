# ============================================================
# Database Module Configuration for Staging
# ============================================================
# Aurora PostgreSQL Serverless v2、MongoDB Atlas、SSM Parameter Storeを構築します。

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
  source = "../../../modules/database"
}

# 依存モジュール
dependency "network" {
  config_path = "../network"

  mock_outputs = {
    vpc_id             = "vpc-mock-id"
    private_subnet_ids = ["subnet-mock-private-1", "subnet-mock-private-2"]
  }
}

dependency "security" {
  config_path = "../security"

  mock_outputs = {
    db_security_group_id = "sg-mock-db"
  }
}

# モジュール固有の変数
inputs = {
  # ネットワーク設定（networkモジュールから取得）
  vpc_id             = dependency.network.outputs.vpc_id
  private_subnet_ids = dependency.network.outputs.private_subnet_ids

  # セキュリティ設定（securityモジュールから取得）
  db_security_group_id = dependency.security.outputs.db_security_group_id

  # Aurora PostgreSQL設定
  engine_version = "16.4"
  db_name        = "bookmarkdb"
  db_username    = "dbadmin" # TODO: セキュアな値に変更

  # Aurora Serverless v2設定（コスト最適化）
  instance_class = "db.serverless"
  instance_count = 1   # シングルインスタンス
  min_capacity   = 0.5 # 最小0.5 ACU
  max_capacity   = 1.0 # 最大1.0 ACU

  # バックアップ設定
  backup_retention_period      = 7                     # 7日間保存
  preferred_backup_window      = "03:00-04:00"         # JST 12:00-13:00
  preferred_maintenance_window = "sun:04:00-sun:05:00" # JST 日曜13:00-14:00

  # 削除保護（staging環境では無効化）
  deletion_protection = false
  skip_final_snapshot = true
}
