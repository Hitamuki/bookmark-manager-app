# ============================================================
# Terragrunt Root Configuration
# ============================================================
# このファイルは全環境で共通の設定を定義します。
# 各環境の terragrunt.hcl で include することで設定を継承できます。

# ローカルバックエンド設定
# NOTE: 現在は学習・開発用にローカルstateを使用しています。
# チーム開発やCI/CD導入時にはS3バックエンドへの移行を推奨します。
# 移行手順については各環境のREADME.mdを参照してください。
remote_state {
  backend = "local"

  config = {
    # 各モジュールごとに異なるstateファイルを使用
    path = "${get_parent_terragrunt_dir()}/${path_relative_to_include()}/terraform.tfstate"
  }

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

# Terraform設定の生成
generate "provider" {
  path      = "provider_override.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
EOF
}

# Terraformの設定
terraform {
  # Terraformのバージョン制約
  # 依存関係の変更時に自動的にterraform initを実行
  extra_arguments "auto_init" {
    commands = [
      "init",
      "plan",
      "apply",
      "destroy",
      "refresh",
      "import",
      "taint",
      "untaint"
    ]

    arguments = []
  }

  # 環境変数の設定
  extra_arguments "common_vars" {
    commands = get_terraform_commands_that_need_vars()

    optional_var_files = [
      "${get_terragrunt_dir()}/terraform.tfvars"
    ]
  }
}

# ============================================================
# 共通変数定義
# ============================================================
locals {
  # 全環境共通のプロジェクト名
  project_name = "bookmark-manager"
}

# 共通のinputs（全環境で使用される変数のデフォルト値）
inputs = {
  # プロジェクト名（全環境共通）
  project_name = local.project_name

  # タグは各環境で上書き可能
  common_tags = {
    ManagedBy = "Terragrunt"
  }
}
