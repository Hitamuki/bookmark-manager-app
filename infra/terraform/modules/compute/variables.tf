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
