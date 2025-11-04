output "cluster_id" {
  description = "Aurora cluster ID"
  value       = aws_rds_cluster.main.id
}

output "cluster_endpoint" {
  description = "Aurora cluster endpoint"
  value       = aws_rds_cluster.main.endpoint
  sensitive   = true
}

output "reader_endpoint" {
  description = "Aurora reader endpoint"
  value       = aws_rds_cluster.main.reader_endpoint
  sensitive   = true
}

output "cluster_port" {
  description = "Aurora cluster port"
  value       = aws_rds_cluster.main.port
}

output "database_name" {
  description = "Database name"
  value       = aws_rds_cluster.main.database_name
}

output "db_password_ssm_parameter" {
  description = "SSM Parameter name for DB password"
  value       = aws_ssm_parameter.db_password.name
}

output "database_url_ssm_parameter" {
  description = "SSM Parameter name for DATABASE_URL"
  value       = aws_ssm_parameter.database_url.name
}
