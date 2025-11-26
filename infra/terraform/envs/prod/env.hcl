# ============================================================
# Production Environment Configuration
# ============================================================

locals {
  root_config = read_terragrunt_config(find_in_parent_folders("root.hcl"))

  project_name = local.root_config.locals.project_name
  environment  = basename(dirname(get_terragrunt_dir())) # "prod"
  aws_region   = "ap-northeast-1"

  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "Terragrunt"
  }
}

inputs = merge(
  local.common_tags,
  {
    project_name = local.project_name
    environment  = local.environment
    aws_region   = local.aws_region
  }
)
