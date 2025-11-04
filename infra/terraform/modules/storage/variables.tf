variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "enable_versioning" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = false  # staging環境ではコスト削減のため無効
}

variable "lifecycle_rules" {
  description = "S3 lifecycle rules"
  type = object({
    transition_to_ia_days = number
    expiration_days       = number
  })
  default = {
    transition_to_ia_days = 90
    expiration_days       = 365
  }
}

variable "cors_allowed_origins" {
  description = "Allowed origins for CORS"
  type        = list(string)
  default     = ["*"]  # 本番環境では具体的なドメインを指定
}
