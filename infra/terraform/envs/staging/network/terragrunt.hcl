# ============================================================
# Network Module Configuration for Staging
# ============================================================
# VPC、サブネット、ルーティングテーブルを構築します。

# 環境設定の継承
include "root" {
  path = find_in_parent_folders("root.hcl")
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
}
