/**
 * Variables for monitoring module
 */

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

# Sentry設定
variable "sentry_organization" {
  description = "Sentry organization slug"
  type        = string
}

variable "sentry_team" {
  description = "Sentry team slug"
  type        = string
}

# アラート設定
variable "alert_email" {
  description = "Email address for alerts"
  type        = string
}

# タグ設定
variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
}
