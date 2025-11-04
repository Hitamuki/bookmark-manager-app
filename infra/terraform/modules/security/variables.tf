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

variable "allowed_cidr_blocks" {
  description = "Allowed CIDR blocks for ALB access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
