# ============================================================
# Route53 DNS Records
# ============================================================

# Aレコード（エイリアス）: カスタムドメイン -> ALB
resource "aws_route53_record" "alb" {
  count = var.enable_route53 ? 1 : 0

  zone_id = local.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# Aレコード（エイリアス）: www サブドメイン -> ALB
resource "aws_route53_record" "alb_www" {
  count = var.enable_route53 ? 1 : 0

  zone_id = local.route53_zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
