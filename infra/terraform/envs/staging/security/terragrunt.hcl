# ============================================================
# Security Module Configuration for Staging
# ============================================================
# セキュリティグループ、IAMロール・ポリシーを構築します。

# ルート設定の継承
include "root" {
  path = find_in_parent_folders("root.hcl")
}

# 親環境設定の継承
include "env" {
  path = find_in_parent_folders("env.hcl")
}

# Terraformモジュールのソースパス
terraform {
  source = "../../../modules/security"
}

# networkモジュールへの依存
dependency "network" {
  config_path = "../network"

  mock_outputs = {
    vpc_id = "vpc-mock-id"
  }
}

# モジュール固有の変数
inputs = {
  # networkモジュールの出力を参照
  vpc_id = dependency.network.outputs.vpc_id

  # ALBへのアクセス許可CIDR（全開放）
  allowed_cidr_blocks = ["0.0.0.0/0"]
}
