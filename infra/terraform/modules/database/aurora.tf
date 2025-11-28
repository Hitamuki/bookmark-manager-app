# ============================================================
# Aurora Serverless v2 (本番環境用)
# ============================================================
# use_aurora = true の場合にのみ作成されます

# DB Subnet Group
resource "aws_db_subnet_group" "aurora" {
  count = var.use_aurora ? 1 : 0

  name       = "${var.project_name}-${var.environment}-aurora-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-subnet-group"
  }
}

# Random password for Aurora
resource "random_password" "aurora_password" {
  count = var.use_aurora ? 1 : 0

  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Aurora Cluster (PostgreSQL Serverless v2)
resource "aws_rds_cluster" "main" {
  count = var.use_aurora ? 1 : 0

  cluster_identifier      = "${var.project_name}-${var.environment}-aurora"
  engine                  = "aurora-postgresql"
  engine_mode             = "provisioned"  # Serverless v2では"provisioned"を使用
  engine_version          = var.engine_version
  database_name           = var.db_name
  master_username         = var.db_username
  master_password         = random_password.aurora_password[0].result
  db_subnet_group_name    = aws_db_subnet_group.aurora[0].name
  vpc_security_group_ids  = [var.db_security_group_id]
  backup_retention_period = var.backup_retention_period
  preferred_backup_window = var.preferred_backup_window
  skip_final_snapshot     = var.skip_final_snapshot
  deletion_protection     = var.deletion_protection

  # Serverless v2スケーリング設定
  serverlessv2_scaling_configuration {
    min_capacity = var.min_capacity
    max_capacity = var.max_capacity
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-cluster"
  }
}

# Aurora Cluster Instance (Serverless v2)
resource "aws_rds_cluster_instance" "main" {
  count = var.use_aurora ? var.instance_count : 0

  identifier           = "${var.project_name}-${var.environment}-aurora-${count.index + 1}"
  cluster_identifier   = aws_rds_cluster.main[0].id
  instance_class       = "db.serverless"  # Aurora Serverless v2
  engine               = aws_rds_cluster.main[0].engine
  engine_version       = aws_rds_cluster.main[0].engine_version
  publicly_accessible  = false
  db_subnet_group_name = aws_db_subnet_group.aurora[0].name

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-instance-${count.index + 1}"
  }
}

# Store Aurora password in SSM Parameter Store
resource "aws_ssm_parameter" "aurora_password" {
  count = var.use_aurora ? 1 : 0

  name        = "/${var.project_name}/${var.environment}/db/password"
  description = "Aurora database password"
  type        = "SecureString"
  value       = random_password.aurora_password[0].result

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-password"
  }
}

# Store Aurora endpoint in SSM Parameter Store
resource "aws_ssm_parameter" "aurora_endpoint" {
  count = var.use_aurora ? 1 : 0

  name        = "/${var.project_name}/${var.environment}/db/endpoint"
  description = "Aurora database endpoint"
  type        = "String"
  value       = aws_rds_cluster.main[0].endpoint

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-endpoint"
  }
}

# Store Aurora DATABASE_URL in SSM Parameter Store
resource "aws_ssm_parameter" "aurora_database_url" {
  count = var.use_aurora ? 1 : 0

  name        = "/${var.project_name}/${var.environment}/DATABASE_URL"
  description = "Database connection URL for Prisma (Aurora)"
  type        = "SecureString"
  value       = "postgresql://${var.db_username}:${urlencode(random_password.aurora_password[0].result)}@${aws_rds_cluster.main[0].endpoint}:5432/${var.db_name}?schema=public"

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-database-url"
  }
}
