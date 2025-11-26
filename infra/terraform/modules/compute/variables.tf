variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "ALB Security Group ID"
  type        = string
}

variable "ecs_security_group_id" {
  description = "ECS Security Group ID"
  type        = string
}

variable "ecs_task_execution_role_arn" {
  description = "ECS Task Execution Role ARN"
  type        = string
}

variable "ecs_task_role_arn" {
  description = "ECS Task Role ARN"
  type        = string
}

# Web (Next.js) Configuration
variable "web_cpu" {
  description = "CPU units for web container"
  type        = number
  default     = 256
}

variable "web_memory" {
  description = "Memory for web container in MB"
  type        = number
  default     = 512
}

variable "web_count" {
  description = "Number of web tasks"
  type        = number
  default     = 1
}

variable "web_image" {
  description = "Docker image for web application"
  type        = string
  default     = "nginx:latest"
}

variable "web_environment" {
  description = "Environment variables for web container"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

# API (NestJS) Configuration
variable "api_cpu" {
  description = "CPU units for API container"
  type        = number
  default     = 256
}

variable "api_memory" {
  description = "Memory for API container in MB"
  type        = number
  default     = 512
}

variable "api_count" {
  description = "Number of API tasks"
  type        = number
  default     = 1
}

variable "api_image" {
  description = "Docker image for API application"
  type        = string
  default     = "nginx:latest"
}

variable "api_environment" {
  description = "Environment variables for API container"
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

# Auto Scheduling Configuration
variable "enable_auto_schedule" {
  description = "Enable ECS auto stop/start schedule"
  type        = bool
  default     = false
}

variable "schedule_start_cron" {
  description = "Cron expression for starting ECS tasks (UTC). Default: 9:00 JST (0:00 UTC) on weekdays"
  type        = string
  default     = "cron(0 0 ? * MON-FRI *)"
}

variable "schedule_stop_cron" {
  description = "Cron expression for stopping ECS tasks (UTC). Default: 22:00 JST (13:00 UTC) on weekdays"
  type        = string
  default     = "cron(0 13 ? * MON-FRI *)"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# Datadog設定
variable "enable_datadog" {
  description = "Enable Datadog Agent sidecar"
  type        = bool
  default     = false
}

variable "app_version" {
  description = "Application version for Datadog tagging"
  type        = string
  default     = "1.0.0"
}

# ============================================================
# オートスケーリング設定
# ============================================================

variable "enable_autoscaling" {
  description = "Enable ECS auto scaling"
  type        = bool
  default     = false
}

# Web オートスケーリング
variable "web_autoscaling_min_capacity" {
  description = "Minimum number of web tasks for autoscaling"
  type        = number
  default     = 1
}

variable "web_autoscaling_max_capacity" {
  description = "Maximum number of web tasks for autoscaling"
  type        = number
  default     = 4
}

variable "web_autoscaling_cpu_threshold" {
  description = "CPU utilization threshold for web autoscaling"
  type        = number
  default     = 70
}

variable "web_autoscaling_memory_threshold" {
  description = "Memory utilization threshold for web autoscaling"
  type        = number
  default     = 80
}

# API オートスケーリング
variable "api_autoscaling_min_capacity" {
  description = "Minimum number of API tasks for autoscaling"
  type        = number
  default     = 1
}

variable "api_autoscaling_max_capacity" {
  description = "Maximum number of API tasks for autoscaling"
  type        = number
  default     = 4
}

variable "api_autoscaling_cpu_threshold" {
  description = "CPU utilization threshold for API autoscaling"
  type        = number
  default     = 70
}

variable "api_autoscaling_memory_threshold" {
  description = "Memory utilization threshold for API autoscaling"
  type        = number
  default     = 80
}

# ============================================================
# CloudWatch Logs設定
# ============================================================

variable "cloudwatch_logs_retention_days" {
  description = "CloudWatch Logs retention in days"
  type        = number
  default     = 7
}

# ============================================================
# ALB設定
# ============================================================

variable "enable_alb_deletion_protection" {
  description = "Enable ALB deletion protection"
  type        = bool
  default     = false
}

# ============================================================
# Container Insights設定
# ============================================================

variable "enable_container_insights" {
  description = "Enable ECS Container Insights"
  type        = bool
  default     = false
}

# ============================================================
# ECS配置先設定
# ============================================================

variable "use_private_subnet" {
  description = "Deploy ECS tasks in private subnet (true for production)"
  type        = bool
  default     = false # staging: false (public), production: true (private)
}

# ============================================================
# WAF設定
# ============================================================

variable "waf_web_acl_arn" {
  description = "WAF Web ACL ARN from security module (optional)"
  type        = string
  default     = null
}

# ============================================================
# Route53 & ACM設定
# ============================================================

variable "enable_route53" {
  description = "Enable Route53 for custom domain"
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Custom domain name (e.g., tidilyspace.app)"
  type        = string
  default     = null
}

variable "create_route53_zone" {
  description = "Create new Route53 hosted zone (false if using existing zone)"
  type        = bool
  default     = false
}

variable "route53_zone_id" {
  description = "Existing Route53 hosted zone ID (required if create_route53_zone is false)"
  type        = string
  default     = null
}

variable "enable_acm" {
  description = "Enable ACM certificate for HTTPS"
  type        = bool
  default     = false
}

variable "acm_certificate_arn" {
  description = "Existing ACM certificate ARN (if not provided, will create new one)"
  type        = string
  default     = null
}

variable "acm_validation_method" {
  description = "ACM certificate validation method (DNS or EMAIL)"
  type        = string
  default     = "DNS"
}
