# WAF設定（staging環境ではコスト削減のためコメントアウト）
# 本番環境では有効化を推奨

# resource "aws_wafv2_web_acl" "main" {
#   name  = "${var.project_name}-${var.environment}-waf"
#   scope = "REGIONAL"
#
#   default_action {
#     allow {}
#   }
#
#   # AWS Managed Rules - Core Rule Set
#   rule {
#     name     = "AWSManagedRulesCommonRuleSet"
#     priority = 1
#
#     override_action {
#       none {}
#     }
#
#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesCommonRuleSet"
#         vendor_name = "AWS"
#       }
#     }
#
#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AWSManagedRulesCommonRuleSetMetric"
#       sampled_requests_enabled   = true
#     }
#   }
#
#   # AWS Managed Rules - Known Bad Inputs
#   rule {
#     name     = "AWSManagedRulesKnownBadInputsRuleSet"
#     priority = 2
#
#     override_action {
#       none {}
#     }
#
#     statement {
#       managed_rule_group_statement {
#         name        = "AWSManagedRulesKnownBadInputsRuleSet"
#         vendor_name = "AWS"
#       }
#     }
#
#     visibility_config {
#       cloudwatch_metrics_enabled = true
#       metric_name                = "AWSManagedRulesKnownBadInputsRuleSetMetric"
#       sampled_requests_enabled   = true
#     }
#   }
#
#   visibility_config {
#     cloudwatch_metrics_enabled = true
#     metric_name                = "${var.project_name}-${var.environment}-waf"
#     sampled_requests_enabled   = true
#   }
#
#   tags = {
#     Name = "${var.project_name}-${var.environment}-waf"
#   }
# }
