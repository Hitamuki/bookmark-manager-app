# ============================================================
# ACM Certificate for HTTPS
# ============================================================

# Route53ホストゾーン（既存または新規作成）
resource "aws_route53_zone" "main" {
  count = var.enable_route53 && var.create_route53_zone ? 1 : 0

  name = var.domain_name

  tags = {
    Name = "${var.project_name}-${var.environment}-zone"
  }
}

# 既存のRoute53ホストゾーンを参照
data "aws_route53_zone" "existing" {
  count = var.enable_route53 && !var.create_route53_zone && var.route53_zone_id != null ? 1 : 0

  zone_id = var.route53_zone_id
}

# ホストゾーンIDを統一（新規または既存）
locals {
  route53_zone_id = var.enable_route53 ? (
    var.create_route53_zone ? aws_route53_zone.main[0].zone_id : var.route53_zone_id
  ) : null
}

# ============================================================
# ACM Certificate
# ============================================================

resource "aws_acm_certificate" "main" {
  count = var.enable_acm && var.acm_certificate_arn == null ? 1 : 0

  domain_name       = var.domain_name
  validation_method = var.acm_validation_method

  # ワイルドカード証明書（サブドメイン対応）
  subject_alternative_names = [
    "*.${var.domain_name}"
  ]

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cert"
  }
}

# ============================================================
# DNS Validation Records for ACM
# ============================================================

resource "aws_route53_record" "cert_validation" {
  for_each = var.enable_acm && var.enable_route53 && var.acm_certificate_arn == null ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  type            = each.value.type
  zone_id         = local.route53_zone_id
  records         = [each.value.record]
  ttl             = 60
}

# ============================================================
# ACM Certificate Validation
# ============================================================

resource "aws_acm_certificate_validation" "main" {
  count = var.enable_acm && var.enable_route53 && var.acm_certificate_arn == null ? 1 : 0

  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]

  timeouts {
    create = "10m"
  }
}

# ============================================================
# Locals for Certificate ARN
# ============================================================

locals {
  # 既存の証明書ARNまたは新規作成した証明書ARN
  certificate_arn = var.enable_acm ? (
    var.acm_certificate_arn != null ? var.acm_certificate_arn : aws_acm_certificate.main[0].arn
  ) : null
}
