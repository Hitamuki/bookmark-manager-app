# ============================================================
# Staging Environment Configuration
# ============================================================
# Staging環境全体で共通の設定を定義します。
# 各モジュールからincludeされることを想定しています。

# Staging環境の共通変数
locals {
  # root.hclから共通設定を読み込む
  root_config = read_terragrunt_config(find_in_parent_folders("root.hcl"))

  # 基本設定
  # project_nameはroot.hclから取得
  project_name = local.root_config.locals.project_name
  # 環境名は親ディレクトリ名から自動取得
  environment = basename(get_terragrunt_dir())
  aws_region  = "ap-northeast-1"

  # 共通タグ
  common_tags = {
    Project     = local.project_name
    Environment = local.environment
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
