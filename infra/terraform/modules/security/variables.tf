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

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
}

variable "allowed_cidr_blocks" {
  description = "Allowed CIDR blocks for ALB access (固定IPアドレス)"
  type        = list(string)
  default     = []
}

variable "enable_dynamic_ip" {
  description = "Enable dynamic IP address detection (terraform apply実行時のIPアドレスを自動取得)"
  type        = bool
  default     = true
}

variable "bastion_security_group_id" {
  description = "Bastion Security Group ID from network module"
  type        = string
  default     = null
}

variable "allow_all_ips" {
  description = "Allow all IPs to access ALB (true for production public service)"
  type        = bool
  default     = false
}

variable "enable_waf" {
  description = "Enable WAF for ALB (recommended for production)"
  type        = bool
  default     = false
}
