# ============================================================
# Database Outputs (Aurora or RDS)
# ============================================================

output "db_identifier" {
  description = "Database identifier (Aurora cluster ID or RDS instance ID)"
  value       = var.use_aurora ? (length(aws_rds_cluster.main) > 0 ? aws_rds_cluster.main[0].id : null) : (length(aws_db_instance.main) > 0 ? aws_db_instance.main[0].id : null)
}

output "db_endpoint" {
  description = "Database endpoint"
  value       = var.use_aurora ? (length(aws_rds_cluster.main) > 0 ? aws_rds_cluster.main[0].endpoint : null) : (length(aws_db_instance.main) > 0 ? aws_db_instance.main[0].address : null)
  sensitive   = true
}

output "db_port" {
  description = "Database port"
  value       = var.use_aurora ? (length(aws_rds_cluster.main) > 0 ? aws_rds_cluster.main[0].port : null) : 5432
}

output "database_name" {
  description = "Database name"
  value       = var.db_name
}

output "db_password_ssm_parameter" {
  description = "SSM Parameter name for DB password"
  value       = var.use_aurora ? (length(aws_ssm_parameter.aurora_password) > 0 ? aws_ssm_parameter.aurora_password[0].name : null) : (length(aws_ssm_parameter.rds_password) > 0 ? aws_ssm_parameter.rds_password[0].name : null)
}

output "database_url_ssm_parameter" {
  description = "SSM Parameter name for DATABASE_URL"
  value       = var.use_aurora ? (length(aws_ssm_parameter.aurora_database_url) > 0 ? aws_ssm_parameter.aurora_database_url[0].name : null) : (length(aws_ssm_parameter.rds_database_url) > 0 ? aws_ssm_parameter.rds_database_url[0].name : null)
}

# Aurora固有のoutput（Auroraの場合のみ値が入る）
output "reader_endpoint" {
  description = "Aurora reader endpoint (Aurora only)"
  value       = var.use_aurora && length(aws_rds_cluster.main) > 0 ? aws_rds_cluster.main[0].reader_endpoint : null
  sensitive   = true
}
