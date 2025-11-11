# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false  # staging環境では無効化

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
    path                = "/api/health"
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

# HTTP Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# Listener Rule for API
resource "aws_lb_listener_rule" "api" {
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

# HTTPS Listener (SSL証明書が必要な場合)
# resource "aws_lb_listener" "https" {
#   load_balancer_arn = aws_lb.main.arn
#   port              = 443
#   protocol          = "HTTPS"
#   ssl_policy        = "ELBSecurityPolicy-2016-08"
#   certificate_arn   = var.certificate_arn
#
#   default_action {
#     type             = "forward"
#     target_group_arn = aws_lb_target_group.web.arn
#   }
# }
