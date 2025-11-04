output "assets_bucket_id" {
  description = "S3 assets bucket ID"
  value       = aws_s3_bucket.assets.id
}

output "assets_bucket_name" {
  description = "S3 assets bucket name"
  value       = aws_s3_bucket.assets.bucket
}

output "assets_bucket_arn" {
  description = "S3 assets bucket ARN"
  value       = aws_s3_bucket.assets.arn
}

output "assets_bucket_domain_name" {
  description = "S3 assets bucket domain name"
  value       = aws_s3_bucket.assets.bucket_domain_name
}

output "assets_bucket_regional_domain_name" {
  description = "S3 assets bucket regional domain name"
  value       = aws_s3_bucket.assets.bucket_regional_domain_name
}
