# ============================================================
# Network Module Configuration for Staging
# ============================================================
# VPC、サブネット、ルーティングテーブルを構築します。

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
  source = "../../../modules/network"
}

# モジュール固有の変数
inputs = {
  # VPC設定
  vpc_cidr = "10.0.0.0/16"

  # アベイラビリティゾーン
  availability_zones = [
    "ap-northeast-1a",
    "ap-northeast-1c"
  ]

  # NAT Gateway設定（コスト削減: Staging環境では無効化）
  enable_nat_gateway = false

  # Bastion設定
  enable_bastion        = true
  bastion_instance_type = "t3.nano"  # 最小インスタンス（月額$3-4）
}
