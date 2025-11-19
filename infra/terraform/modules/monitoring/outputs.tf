/**
 * Outputs for monitoring module
 */

# Sentry出力
output "sentry_project_id" {
  description = "Sentry project ID"
  value       = sentry_project.web.id
}

output "sentry_dsn" {
  description = "Sentry DSN (Public)"
  value       = sentry_key.web.dsn_public
  sensitive   = true
}

output "sentry_dsn_parameter_name" {
  description = "SSM Parameter Store name for Sentry DSN"
  value       = aws_ssm_parameter.sentry_dsn.name
}

# Datadog出力
output "datadog_api_key_secret_arn" {
  description = "ARN of Datadog API Key in Secrets Manager"
  value       = data.aws_secretsmanager_secret.datadog_api_key.arn
}

output "datadog_monitors" {
  description = "Datadog monitor IDs"
  value = {
    api_error_rate = datadog_monitor.api_error_rate.id
    api_latency    = datadog_monitor.api_latency.id
    rds_cpu        = datadog_monitor.rds_cpu.id
  }
}

output "datadog_dashboard_url" {
  description = "Datadog dashboard URL"
  value       = datadog_dashboard.bookmark_manager.url
}
