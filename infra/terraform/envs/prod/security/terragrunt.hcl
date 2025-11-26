# ============================================================
# Security Module Configuration for Production
# ============================================================

include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

terraform {
  source = "../../../modules/security"
}

dependency "network" {
  config_path = "../network"

  mock_outputs = {
    vpc_id                    = "vpc-mock-id"
    vpc_cidr                  = "10.1.0.0/16"
    bastion_security_group_id = null
  }
}

inputs = {
  vpc_id   = dependency.network.outputs.vpc_id
  vpc_cidr = dependency.network.outputs.vpc_cidr

  bastion_security_group_id = dependency.network.outputs.bastion_security_group_id

  # 本番環境: IP制限なし（全ユーザーアクセス可能）
  allow_all_ips = true

  # 固定IP設定は不要
  allowed_cidr_blocks = []
  enable_dynamic_ip   = false

  # WAF有効化（本番環境でセキュリティ強化）
  enable_waf = true
}
