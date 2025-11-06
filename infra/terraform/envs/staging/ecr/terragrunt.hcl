# ============================================================
# ECR Module Configuration for Staging
# ============================================================
# コンテナイメージを保存するECRリポジトリを構築します。

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
  source = "../../../modules/ecr"
}

# モジュール固有の変数
inputs = {
  # イメージタグの変更可否（MUTABLE: 変更可能、IMMUTABLE: 変更不可）
  image_tag_mutability = "MUTABLE"

  # プッシュ時の自動スキャン（脆弱性検出）
  scan_on_push = true

  # 保持するイメージの最大数（古いイメージは自動削除）
  max_image_count = 10

  # イメージが残っていてもリポジトリを削除（staging環境のみtrue）
  force_delete = true
}
