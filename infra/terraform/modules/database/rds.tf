# ============================================================
# RDS PostgreSQL (Staging環境でコスト削減)
# ============================================================
# use_aurora = false の場合にのみ作成されます

# DB Subnet Group
resource "aws_db_subnet_group" "rds" {
  count = var.use_aurora ? 0 : 1

  name       = "${var.project_name}-${var.environment}-rds-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-subnet-group"
  }
}

# Random password for RDS
resource "random_password" "rds_password" {
  count = var.use_aurora ? 0 : 1

  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# RDS PostgreSQL Instance (Aurora Serverless v2の代替)
resource "aws_db_instance" "main" {
  count = var.use_aurora ? 0 : 1

  identifier     = "${var.project_name}-${var.environment}-postgres"
  engine         = "postgres"
  engine_version = var.engine_version

  # インスタンスクラス（db.t4g.micro = Graviton2, 最安値）
  instance_class = var.instance_class

  # ストレージ設定
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage # Auto Scaling有効化
  storage_type          = "gp3"                     # gp3はgp2より高性能・安価
  storage_encrypted     = true

  # データベース設定
  db_name  = var.db_name
  username = var.db_username
  password = random_password.rds_password[0].result
  port     = 5432

  # ネットワーク設定
  db_subnet_group_name   = aws_db_subnet_group.rds[0].name
  vpc_security_group_ids = [var.db_security_group_id]
  publicly_accessible    = false

  # バックアップ設定
  backup_retention_period = var.backup_retention_period
  backup_window           = var.preferred_backup_window
  maintenance_window      = "sun:04:00-sun:05:00" # 日曜 13:00-14:00 JST

  # スナップショット設定
  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.project_name}-${var.environment}-final-snapshot"
  copy_tags_to_snapshot     = true

  # 削除保護（staging環境では無効化）
  deletion_protection = var.deletion_protection

  # パフォーマンス設定
  performance_insights_enabled    = false # コスト削減のため無効化
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports

  # マイナーバージョン自動アップグレード
  auto_minor_version_upgrade = true

  # パラメータグループ（デフォルト使用でコスト削減）
  parameter_group_name = "default.postgres17"

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-postgres"
  }
}

# Store RDS password in SSM Parameter Store
resource "aws_ssm_parameter" "rds_password" {
  count = var.use_aurora ? 0 : 1

  name        = "/${var.project_name}/${var.environment}/db/password"
  description = "RDS PostgreSQL database password"
  type        = "SecureString"
  value       = random_password.rds_password[0].result

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-password"
  }
}

# Store RDS endpoint in SSM Parameter Store
resource "aws_ssm_parameter" "rds_endpoint" {
  count = var.use_aurora ? 0 : 1

  name        = "/${var.project_name}/${var.environment}/db/endpoint"
  description = "RDS PostgreSQL database endpoint"
  type        = "String"
  value       = aws_db_instance.main[0].address

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-endpoint"
  }
}

# Store RDS DATABASE_URL in SSM Parameter Store
resource "aws_ssm_parameter" "rds_database_url" {
  count = var.use_aurora ? 0 : 1

  name        = "/${var.project_name}/${var.environment}/DATABASE_URL"
  description = "Database connection URL for Prisma (RDS)"
  type        = "SecureString"
  value       = "postgresql://${var.db_username}:${urlencode(random_password.rds_password[0].result)}@${aws_db_instance.main[0].address}:5432/${var.db_name}?schema=public"

  tags = {
    Name = "${var.project_name}-${var.environment}-rds-database-url"
  }
}
