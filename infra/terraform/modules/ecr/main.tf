# ============================================================
# ECR (Elastic Container Registry) Module
# ============================================================
# コンテナイメージを保存するためのECRリポジトリを管理します。

# Webアプリ用ECRリポジトリ
resource "aws_ecr_repository" "web" {
  name                 = "${var.project_name}-${var.environment}-web"
  image_tag_mutability = var.image_tag_mutability
  force_delete         = var.force_delete

  # イメージスキャン設定
  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  # 暗号化設定
  encryption_configuration {
    encryption_type = "AES256" # KMSを使用する場合は"KMS"に変更
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-web"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# API用ECRリポジトリ
resource "aws_ecr_repository" "api" {
  name                 = "${var.project_name}-${var.environment}-api"
  image_tag_mutability = var.image_tag_mutability
  force_delete         = var.force_delete

  # イメージスキャン設定
  image_scanning_configuration {
    scan_on_push = var.scan_on_push
  }

  # 暗号化設定
  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-api"
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Webリポジトリのライフサイクルポリシー
resource "aws_ecr_lifecycle_policy" "web" {
  repository = aws_ecr_repository.web.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.max_image_count} images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = var.max_image_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# APIリポジトリのライフサイクルポリシー
resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.max_image_count} images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = var.max_image_count
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
