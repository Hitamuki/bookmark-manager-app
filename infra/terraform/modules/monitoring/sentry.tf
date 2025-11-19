/**
 * Sentry設定
 * Next.jsアプリケーションのエラー監視
 */

# Sentryプロジェクト作成
resource "sentry_project" "web" {
  organization = var.sentry_organization
  teams        = [var.sentry_team]
  name         = "${var.project_name}-web-${var.environment}"
  platform     = "javascript-nextjs"
}

# Sentry APIキー作成
resource "sentry_key" "web" {
  organization = sentry_project.web.organization
  project      = sentry_project.web.id
  name         = "Production"
}

# SentryのDSNをSSM Parameter Storeに保存
resource "aws_ssm_parameter" "sentry_dsn" {
  name        = "/${var.project_name}/${var.environment}/SENTRY_DSN"
  description = "Sentry DSN for Next.js application"
  type        = "SecureString"
  value       = sentry_key.web.dsn_public

  tags = {
    Name        = "${var.project_name}-${var.environment}-sentry-dsn"
    Environment = var.environment
    Service     = "monitoring"
    ManagedBy   = "terraform"
  }
}

# Sentryアラート設定（新規エラー検知）
resource "sentry_issue_alert" "critical_errors" {
  organization = sentry_project.web.organization
  project      = sentry_project.web.id
  name         = "Critical Errors - ${var.environment}"

  action_match = "any"
  filter_match = "all"
  frequency    = 30 # 30分間隔

  conditions = jsonencode([
    {
      id   = "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition"
      name = "A new issue is created"
    },
    {
      id    = "sentry.rules.conditions.event_frequency.EventFrequencyCondition"
      name  = "The issue is seen more than 100 times in 1h"
      value = 100
      interval = "1h"
    }
  ])

  actions = jsonencode([
    {
      id         = "sentry.mail.actions.NotifyEmailAction"
      targetType = "IssueOwners"
    }
  ])
}
