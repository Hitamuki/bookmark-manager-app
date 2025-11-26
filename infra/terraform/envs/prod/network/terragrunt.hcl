# ============================================================
# Network Module Configuration for Production
# ============================================================

include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

terraform {
  source = "../../../modules/network"
}

inputs = {
  # VPC設定（Stagingと競合しないCIDR）
  vpc_cidr = "10.1.0.0/16"

  # アベイラビリティゾーン（Multi-AZ構成）
  availability_zones = [
    "ap-northeast-1a",
    "ap-northeast-1c"
  ]

  # NAT Gateway設定（本番環境では有効化、コスト最適化でSingle-AZ）
  enable_nat_gateway = true

  # Bastion設定（マイグレーション用）
  enable_bastion        = true
  bastion_instance_type = "t3.nano"
}
