# ============================================================
# VPC Endpoints for Cost Optimization
# ============================================================
# ECR、S3へのアクセスをNAT Gateway経由からVPC Endpoint経由に変更し、
# データ転送料を削減します。

# VPC Endpoint用セキュリティグループ
resource "aws_security_group" "vpc_endpoint" {
  name        = "${var.project_name}-${var.environment}-vpce-sg"
  description = "Security group for VPC Endpoints (ECR, CloudWatch Logs)"
  vpc_id      = aws_vpc.main.id

  # HTTPS from VPC CIDR
  ingress {
    description = "Allow HTTPS from VPC"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
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
    Name = "${var.project_name}-${var.environment}-vpce-sg"
  }

  lifecycle {
    ignore_changes = [description, ingress, egress]
  }
}

# ECR API VPC Endpoint (Interface型)
# コスト削減: 1 AZのみ使用 ($0.01/h × 1 AZ = $0.24/day)
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private[0].id]  # 最初のAZのみ
  security_group_ids  = [aws_security_group.vpc_endpoint.id]
  private_dns_enabled = true

  tags = {
    Name = "${var.project_name}-${var.environment}-ecr-api-endpoint"
  }
}

# ECR Docker VPC Endpoint (Interface型)
# コスト削減: 1 AZのみ使用 ($0.01/h × 1 AZ = $0.24/day)
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private[0].id]  # 最初のAZのみ
  security_group_ids  = [aws_security_group.vpc_endpoint.id]
  private_dns_enabled = true

  tags = {
    Name = "${var.project_name}-${var.environment}-ecr-dkr-endpoint"
  }
}

# S3 VPC Endpoint (Gateway型 - 無料)
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private.id]

  tags = {
    Name = "${var.project_name}-${var.environment}-s3-endpoint"
  }
}

# CloudWatch Logs VPC Endpoint (Interface型) - オプション
# コスト削減のため無効化（Staging環境）
# resource "aws_vpc_endpoint" "logs" {
#   vpc_id              = aws_vpc.main.id
#   service_name        = "com.amazonaws.${var.aws_region}.logs"
#   vpc_endpoint_type   = "Interface"
#   subnet_ids          = aws_subnet.private[*].id
#   security_group_ids  = [aws_security_group.vpc_endpoint.id]
#   private_dns_enabled = true
#
#   tags = {
#     Name = "${var.project_name}-${var.environment}-logs-endpoint"
#   }
# }

# Secrets Manager VPC Endpoint (Interface型) - オプション
# resource "aws_vpc_endpoint" "secretsmanager" {
#   vpc_id              = aws_vpc.main.id
#   service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
#   vpc_endpoint_type   = "Interface"
#   subnet_ids          = aws_subnet.private[*].id
#   security_group_ids  = [aws_security_group.vpc_endpoint.id]
#   private_dns_enabled = true
#
#   tags = {
#     Name = "${var.project_name}-${var.environment}-secretsmanager-endpoint"
#   }
# }
