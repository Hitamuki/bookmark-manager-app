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
