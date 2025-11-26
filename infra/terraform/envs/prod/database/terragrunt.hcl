# ============================================================
# Database Module Configuration for Production
# ============================================================

include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

terraform {
  source = "../../../modules/database"
}

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

inputs = {
  vpc_id               = dependency.network.outputs.vpc_id
  private_subnet_ids   = dependency.network.outputs.private_subnet_ids
  db_security_group_id = dependency.security.outputs.db_security_group_id

  # Aurora Serverless v2を使用（本番環境）
  use_aurora = true

  # PostgreSQL設定
  engine_version = "17.6"
  db_name        = "bookmarkdb"
  db_username    = "dbadmin"

  # Aurora Serverless v2スケーリング設定
  min_capacity   = 0.5 # 0.5 ACU (最小)
  max_capacity   = 2.0 # 2 ACU (ピーク時、100ユーザー想定)
  instance_count = 2   # Multi-AZ: 2インスタンス（Writer + Reader）
  # Multi-AZのメリット:
  # - 高可用性: Writer障害時にReaderが自動昇格（1-2分で復旧）
  # - 読み取り負荷分散: Read-onlyクエリをReaderに振り分け可能

  # CloudWatchログエクスポート
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # バックアップ設定（本番環境は長期保存）
  backup_retention_period = 30
  preferred_backup_window = "03:00-04:00"

  # 削除保護（本番環境では有効化）
  deletion_protection = true
  skip_final_snapshot = false
}
