output "alb_arn" {
  description = "ALB ARN"
  value       = aws_lb.main.arn
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "ALB zone ID"
  value       = aws_lb.main.zone_id
}

output "ecs_cluster_id" {
  description = "ECS Cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = aws_ecs_cluster.main.name
}

output "web_service_name" {
  description = "Web ECS Service name"
  value       = aws_ecs_service.web.name
}

output "api_service_name" {
  description = "API ECS Service name"
  value       = aws_ecs_service.api.name
}

output "web_task_definition_arn" {
  description = "Web Task Definition ARN"
  value       = aws_ecs_task_definition.web.arn
}

output "api_task_definition_arn" {
  description = "API Task Definition ARN"
  value       = aws_ecs_task_definition.api.arn
}

# ============================================================
# Route53 & ACM Outputs
# ============================================================

output "route53_zone_id" {
  description = "Route53 Hosted Zone ID"
  value       = var.enable_route53 ? local.route53_zone_id : null
}

output "route53_zone_name_servers" {
  description = "Route53 Hosted Zone Name Servers"
  value       = var.enable_route53 && var.create_route53_zone ? aws_route53_zone.main[0].name_servers : null
}

output "domain_name" {
  description = "Custom domain name"
  value       = var.enable_route53 ? var.domain_name : null
}

output "acm_certificate_arn" {
  description = "ACM Certificate ARN"
  value       = var.enable_acm ? local.certificate_arn : null
}

output "acm_certificate_status" {
  description = "ACM Certificate validation status"
  value       = var.enable_acm && var.acm_certificate_arn == null ? aws_acm_certificate.main[0].status : null
}

output "website_url" {
  description = "Website URL (HTTPS if enabled, otherwise ALB DNS)"
  value       = var.enable_route53 && var.enable_acm ? "https://${var.domain_name}" : "http://${aws_lb.main.dns_name}"
}
