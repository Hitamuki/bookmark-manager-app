# ============================================================
# ECR Module Configuration for Production
# ============================================================

include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

terraform {
  source = "../../../modules/ecr"
}

inputs = {
  image_tag_mutability = "MUTABLE"
  scan_on_push         = true
  max_image_count      = 30    # 本番環境: ロールバック用に多く保持
  force_delete         = false # 本番環境: 誤削除防止
}
