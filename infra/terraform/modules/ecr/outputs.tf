output "web_repository_url" {
  description = "Web application repository URL"
  value       = aws_ecr_repository.web.repository_url
}

output "web_repository_name" {
  description = "Web application repository name"
  value       = aws_ecr_repository.web.name
}

output "web_repository_arn" {
  description = "Web application repository ARN"
  value       = aws_ecr_repository.web.arn
}

output "api_repository_url" {
  description = "API application repository URL"
  value       = aws_ecr_repository.api.repository_url
}

output "api_repository_name" {
  description = "API application repository name"
  value       = aws_ecr_repository.api.name
}

output "api_repository_arn" {
  description = "API application repository ARN"
  value       = aws_ecr_repository.api.arn
}
