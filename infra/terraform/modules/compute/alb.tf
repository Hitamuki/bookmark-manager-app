# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.enable_alb_deletion_protection

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

# Target Group for Web (Next.js)
resource "aws_lb_target_group" "web" {
  name        = "${var.project_name}-${var.environment}-web-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 10  # 再起動を防ぐため増やす（デフォルト: 2）
    timeout             = 10  # タイムアウトを長めに
    interval            = 60  # チェック間隔を長めに（コスト削減）
    path                = "/health"  # Next.jsフロントエンド専用（/api/healthはバックエンド）
    matcher             = "200"
  }

  deregistration_delay = 30  # コスト最適化: デプロイ時間短縮

  tags = {
    Name = "${var.project_name}-${var.environment}-web-tg"
  }
}

# Target Group for API (NestJS)
resource "aws_lb_target_group" "api" {
  name        = "${var.project_name}-${var.environment}-api-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 10  # 再起動を防ぐため増やす（デフォルト: 2）
    timeout             = 10  # タイムアウトを長めに
    interval            = 60  # チェック間隔を長めに（コスト削減）
    path                = "/api/health"
    matcher             = "200"
  }

  deregistration_delay = 30  # コスト最適化: デプロイ時間短縮

  tags = {
    Name = "${var.project_name}-${var.environment}-api-tg"
  }
}

# ============================================================
# HTTP Listener
# ============================================================
# HTTPSが有効な場合はHTTPSにリダイレクト、無効な場合は通常のフォワード
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # HTTPSが有効な場合はリダイレクト
  dynamic "default_action" {
    for_each = var.enable_acm ? [1] : []
    content {
      type = "redirect"
      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }

  # HTTPSが無効な場合は通常のフォワード
  dynamic "default_action" {
    for_each = var.enable_acm ? [] : [1]
    content {
      type             = "forward"
      target_group_arn = aws_lb_target_group.web.arn
    }
  }
}

# HTTPSが無効な場合のみAPIルールを追加（HTTPSの場合は後述のHTTPSリスナーに追加）
resource "aws_lb_listener_rule" "api_http" {
  count = var.enable_acm ? 0 : 1

  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ============================================================
# HTTPS Listener
# ============================================================
resource "aws_lb_listener" "https" {
  count = var.enable_acm ? 1 : 0

  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06" # 最新のTLS 1.3対応ポリシー
  certificate_arn   = local.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# HTTPS Listener Rule for API
resource "aws_lb_listener_rule" "api_https" {
  count = var.enable_acm ? 1 : 0

  listener_arn = aws_lb_listener.https[0].arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# ============================================================
# WAF Web ACL Association
# ============================================================
# WAF Web ACLはsecurityモジュールで作成され、computeモジュールで関連付けられる
# これにより依存関係の循環を回避できる
resource "aws_wafv2_web_acl_association" "alb" {
  count = var.waf_web_acl_arn != null ? 1 : 0

  resource_arn = aws_lb.main.arn
  web_acl_arn  = var.waf_web_acl_arn
}
