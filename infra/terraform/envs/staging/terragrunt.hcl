# ============================================================
# Staging Environment Configuration
# ============================================================
# Staging環境全体で共通の設定を定義します。

# ルート設定の継承
include "root" {
  path = find_in_parent_folders("root.hcl")
}

# Staging環境の共通変数
locals {
  # 基本設定
  project_name = "bookmark-manager"
  environment  = "staging"
  aws_region   = "ap-northeast-1"

  # 共通タグ
  common_tags = {
    Project     = "bookmark-manager"
    Environment = "staging"
    ManagedBy   = "Terragrunt"
  }
}

# 全モジュールで共通のinputs
inputs = merge(
  local.common_tags,
  {
    project_name = local.project_name
    environment  = local.environment
    aws_region   = local.aws_region
  }
)
