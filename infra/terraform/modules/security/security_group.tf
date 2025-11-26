# ============================================================
# Locals - CIDR Blocks Configuration
# ============================================================
locals {
  # 動的IPと固定IPを結合
  # - var.allow_all_ips が true の場合: 全IP許可（本番環境の一般公開サービス）
  # - var.enable_dynamic_ip が true の場合: 実行時のIPアドレス + 固定IP
  # - var.enable_dynamic_ip が false の場合: 固定IPのみ
  all_allowed_cidrs = var.allow_all_ips ? ["0.0.0.0/0"] : (
    var.enable_dynamic_ip ? concat(
      [local.my_ip_cidr],      # 動的に取得した現在のIP
      var.allowed_cidr_blocks  # terraform.tfvarsで指定した固定IP
    ) : var.allowed_cidr_blocks
  )
}

# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = var.vpc_id

  # HTTP
  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = local.all_allowed_cidrs
  }

  # HTTPS
  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = local.all_allowed_cidrs
  }

  # Outbound
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  }
}

# ECS Security Group
resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-${var.environment}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = var.vpc_id

  # Allow traffic from ALB
  ingress {
    description     = "Allow traffic from ALB"
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Outbound
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-sg"
  }
}

# Database Security Group
resource "aws_security_group" "db" {
  name        = "${var.project_name}-${var.environment}-db-sg"
  description = "Security group for Aurora database"
  vpc_id      = var.vpc_id

  # PostgreSQL from ECS
  ingress {
    description     = "Allow PostgreSQL from ECS"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  # Outbound
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-db-sg"
  }
}

# Database Security Group Rule for Bastion
# Bastion Security Groupがnetwork moduleで作成されるため、
# 別途ルールとして追加
resource "aws_security_group_rule" "db_from_bastion" {
  count = var.bastion_security_group_id != null ? 1 : 0

  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = var.bastion_security_group_id
  security_group_id        = aws_security_group.db.id
  description              = "Allow PostgreSQL from Bastion"
}
