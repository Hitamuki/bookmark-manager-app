# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# Random password for DB
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# Aurora Cluster (PostgreSQL Serverless v2)
resource "aws_rds_cluster" "main" {
  cluster_identifier      = "${var.project_name}-${var.environment}-aurora"
  engine                  = "aurora-postgresql"
  engine_mode             = "provisioned"  # Serverless v2では"provisioned"を使用
  engine_version          = var.engine_version
  database_name           = var.db_name
  master_username         = var.db_username
  master_password         = random_password.db_password.result
  db_subnet_group_name    = aws_db_subnet_group.main.name
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
  count = var.instance_count

  identifier           = "${var.project_name}-${var.environment}-aurora-${count.index + 1}"
  cluster_identifier   = aws_rds_cluster.main.id
  instance_class       = var.instance_class  # db.serverless
  engine               = aws_rds_cluster.main.engine
  engine_version       = aws_rds_cluster.main.engine_version
  publicly_accessible  = false
  db_subnet_group_name = aws_db_subnet_group.main.name

  tags = {
    Name = "${var.project_name}-${var.environment}-aurora-instance-${count.index + 1}"
  }
}

# Store DB password in SSM Parameter Store
resource "aws_ssm_parameter" "db_password" {
  name        = "/${var.project_name}/${var.environment}/db/password"
  description = "Aurora database password"
  type        = "SecureString"
  value       = random_password.db_password.result

  tags = {
    Name = "${var.project_name}-${var.environment}-db-password"
  }
}

# Store DB endpoint in SSM Parameter Store
resource "aws_ssm_parameter" "db_endpoint" {
  name        = "/${var.project_name}/${var.environment}/db/endpoint"
  description = "Aurora database endpoint"
  type        = "String"
  value       = aws_rds_cluster.main.endpoint

  tags = {
    Name = "${var.project_name}-${var.environment}-db-endpoint"
  }
}

# Store DATABASE_URL in SSM Parameter Store
resource "aws_ssm_parameter" "database_url" {
  name        = "/${var.project_name}/${var.environment}/DATABASE_URL"
  description = "Database connection URL for Prisma"
  type        = "SecureString"
  value       = "postgresql://${var.db_username}:${random_password.db_password.result}@${aws_rds_cluster.main.endpoint}:5432/${var.db_name}?schema=public"

  tags = {
    Name = "${var.project_name}-${var.environment}-database-url"
  }
}
