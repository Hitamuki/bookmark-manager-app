# MongoDB Atlas設定
#
# MongoDB AtlasはTerraformプロバイダーが別途必要です。
# staging環境ではMongoDB Atlas Freeプランを推奨します。
#
# 手動セットアップ手順:
# 1. MongoDB Atlasアカウント作成
# 2. Freeクラスター作成 (M0)
# 3. データベースユーザー作成
# 4. ネットワークアクセス設定（Private Subnet CIDRを許可）
# 5. 接続文字列を取得してSSM Parameter Storeに保存
#
# Terraformで管理する場合は以下のプロバイダーを使用:
# terraform {
#   required_providers {
#     mongodbatlas = {
#       source  = "mongodb/mongodbatlas"
#       version = "~> 1.0"
#     }
#   }
# }
#
# provider "mongodbatlas" {
#   public_key  = var.mongodbatlas_public_key
#   private_key = var.mongodbatlas_private_key
# }
#
# resource "mongodbatlas_project" "main" {
#   name   = "${var.project_name}-${var.environment}"
#   org_id = var.mongodbatlas_org_id
# }
#
# resource "mongodbatlas_cluster" "main" {
#   project_id = mongodbatlas_project.main.id
#   name       = "${var.project_name}-${var.environment}-mongodb"
#
#   # Free tier (M0)
#   provider_name               = "TENANT"
#   backing_provider_name       = "AWS"
#   provider_region_name        = "AP_NORTHEAST_1"
#   provider_instance_size_name = "M0"
# }

# MongoDB接続文字列を格納するSSM Parameter（手動で設定）
# aws ssm put-parameter --name "/<project>/<env>/MONGODB_URI" --value "<connection-string>" --type "SecureString"
