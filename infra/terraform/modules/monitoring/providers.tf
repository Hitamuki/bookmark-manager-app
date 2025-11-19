/**
 * Providers for monitoring module
 */

terraform {
  required_providers {
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.9"
    }
    datadog = {
      source  = "DataDog/datadog"
      version = "~> 3.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Sentry Auth TokenをSecrets Managerから取得
data "aws_secretsmanager_secret" "sentry_auth_token" {
  name = "sentry/auth_token"
}

data "aws_secretsmanager_secret_version" "sentry_auth_token" {
  secret_id = data.aws_secretsmanager_secret.sentry_auth_token.id
}

# Datadog API KeyとApp KeyをSecrets Managerから取得
data "aws_secretsmanager_secret" "datadog_api_key" {
  name = "datadog/api_key"
}

data "aws_secretsmanager_secret_version" "datadog_api_key" {
  secret_id = data.aws_secretsmanager_secret.datadog_api_key.id
}

data "aws_secretsmanager_secret" "datadog_app_key" {
  name = "datadog/app_key"
}

data "aws_secretsmanager_secret_version" "datadog_app_key" {
  secret_id = data.aws_secretsmanager_secret.datadog_app_key.id
}

# Sentry Provider（Secrets Managerから認証情報を取得）
provider "sentry" {
  token = data.aws_secretsmanager_secret_version.sentry_auth_token.secret_string
}

# Datadog Provider（Secrets Managerから認証情報を取得）
provider "datadog" {
  api_key = data.aws_secretsmanager_secret_version.datadog_api_key.secret_string
  app_key = data.aws_secretsmanager_secret_version.datadog_app_key.secret_string
  # Datadog Site: AP1（日本リージョン）
  api_url = "https://api.ap1.datadoghq.com"
}
