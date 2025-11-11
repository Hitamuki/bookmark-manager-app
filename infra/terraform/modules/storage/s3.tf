# S3 Bucket for Static Assets
resource "aws_s3_bucket" "assets" {
  bucket = "${var.project_name}-${var.environment}-assets"

  tags = {
    Name = "${var.project_name}-${var.environment}-assets"
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id

  versioning_configuration {
    status = var.enable_versioning ? "Enabled" : "Suspended"
  }
}

# S3 Bucket Server-Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "transition-to-ia"
    status = "Enabled"

    filter {}

    transition {
      days          = var.lifecycle_rules.transition_to_ia_days
      storage_class = "STANDARD_IA"
    }

    expiration {
      days = var.lifecycle_rules.expiration_days
    }
  }
}

# S3 Bucket CORS Configuration（必要に応じて）
resource "aws_s3_bucket_cors_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.cors_allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# CloudFront Origin Access Identity（CloudFront使用時）
# resource "aws_cloudfront_origin_access_identity" "assets" {
#   comment = "${var.project_name}-${var.environment} assets OAI"
# }

# S3 Bucket Policy for CloudFront（CloudFront使用時）
# resource "aws_s3_bucket_policy" "assets" {
#   bucket = aws_s3_bucket.assets.id
#
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Sid    = "AllowCloudFrontAccess"
#         Effect = "Allow"
#         Principal = {
#           AWS = aws_cloudfront_origin_access_identity.assets.iam_arn
#         }
#         Action   = "s3:GetObject"
#         Resource = "${aws_s3_bucket.assets.arn}/*"
#       }
#     ]
#   })
# }
