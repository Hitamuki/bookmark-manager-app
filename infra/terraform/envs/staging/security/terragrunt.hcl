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
    vpc_id   = "vpc-mock-id"
    vpc_cidr = "10.0.0.0/16"
  }
}

# モジュール固有の変数
inputs = {
  # networkモジュールの出力を参照
  vpc_id   = dependency.network.outputs.vpc_id
  vpc_cidr = dependency.network.outputs.vpc_cidr

  # ALBへのアクセス許可CIDR（セキュリティ強化: 特定IPのみ許可）
  # - 動的IP検出が有効な場合、terraform apply実行時のIPアドレスが自動追加されます
  # - 固定IPアドレス（オフィス、VPN等）を追加する場合は terraform.tfvars で管理
  # 例: allowed_cidr_blocks = ["203.0.113.0/32", "198.51.100.0/32"]
  allowed_cidr_blocks = []  # デフォルトは空（動的IPのみ使用）

  # 動的IP検出の有効化（デフォルト: true）
  # true: terraform apply実行時のIPアドレスを自動取得して許可
  # false: allowed_cidr_blocksに指定したIPのみ許可
  enable_dynamic_ip = true
}
