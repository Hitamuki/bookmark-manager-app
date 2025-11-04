# SSM Parameter Storeにアプリケーション用の環境変数を保存
#
# 使用方法:
# 1. AWS CLIで手動設定:
#    aws ssm put-parameter --name "/<project>/<env>/<key>" --value "<value>" --type "String|SecureString"
#
# 2. ECSタスク定義でsecretsとして参照:
#    secrets = [
#      {
#        name      = "DATABASE_URL"
#        valueFrom = "arn:aws:ssm:region:account-id:parameter/project/env/DATABASE_URL"
#      }
#    ]

# Node環境変数
resource "aws_ssm_parameter" "node_env" {
  name        = "/${var.project_name}/${var.environment}/NODE_ENV"
  description = "Node environment"
  type        = "String"
  value       = var.environment == "prod" ? "production" : "staging"

  tags = {
    Name = "${var.project_name}-${var.environment}-node-env"
  }
}

# アプリケーション用のプレースホルダーパラメータ
# 実際の値は手動またはCI/CDで設定

# resource "aws_ssm_parameter" "jwt_secret" {
#   name        = "/${var.project_name}/${var.environment}/JWT_SECRET"
#   description = "JWT secret key"
#   type        = "SecureString"
#   value       = "CHANGE_ME"  # 手動で上書き
#
#   lifecycle {
#     ignore_changes = [value]
#   }
# }

# resource "aws_ssm_parameter" "api_key" {
#   name        = "/${var.project_name}/${var.environment}/API_KEY"
#   description = "API key for external services"
#   type        = "SecureString"
#   value       = "CHANGE_ME"  # 手動で上書き
#
#   lifecycle {
#     ignore_changes = [value]
#   }
# }
