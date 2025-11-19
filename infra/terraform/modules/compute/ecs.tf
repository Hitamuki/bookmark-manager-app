# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled" # staging環境ではコスト削減のため無効化
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-cluster"
  }
}

# CloudWatch Log Group for Web
resource "aws_cloudwatch_log_group" "web" {
  name              = "/ecs/${var.project_name}-${var.environment}-web"
  retention_in_days = 7 # staging環境では短期保存

  tags = {
    Name = "${var.project_name}-${var.environment}-web-logs"
  }
}

# CloudWatch Log Group for API
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project_name}-${var.environment}-api"
  retention_in_days = 7 # staging環境では短期保存

  tags = {
    Name = "${var.project_name}-${var.environment}-api-logs"
  }
}

# ECS Service for Web
resource "aws_ecs_service" "web" {
  name            = "${var.project_name}-${var.environment}-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = "${aws_ecs_task_definition.web.family}:${aws_ecs_task_definition.web.revision}"
  desired_count   = var.web_count
  launch_type     = "FARGATE"

  # SSMセッションマネージャー経由でのコンテナアクセスを可能にする
  enable_execute_command = true

  # 新しいイメージがプッシュされた際に自動的に最新タスク定義を使用
  force_new_deployment = true

  # ヘルスチェック猶予期間（アプリケーション起動待ち）
  health_check_grace_period_seconds = 120

  # デプロイ設定（再起動を抑制）
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  # デプロイサーキットブレーカー（自動ロールバック）
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    # NAT Gateway削減のためパブリックサブネットに配置（Staging環境のみ）
    subnets          = var.public_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name = "${var.project_name}-${var.environment}-web-service"
  }
}

# ECS Service for API
resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-${var.environment}-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = "${aws_ecs_task_definition.api.family}:${aws_ecs_task_definition.api.revision}"
  desired_count   = var.api_count
  launch_type     = "FARGATE"

  # SSMセッションマネージャー経由でのDB接続を可能にする
  enable_execute_command = true

  # 新しいイメージがプッシュされた際に自動的に最新タスク定義を使用
  force_new_deployment = true

  # ヘルスチェック猶予期間（アプリケーション起動待ち）
  health_check_grace_period_seconds = 120

  # デプロイ設定（再起動を抑制）
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  # デプロイサーキットブレーカー（自動ロールバック）
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    # NAT Gateway削減のためパブリックサブネットに配置（Staging環境のみ）
    subnets          = var.public_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 3001
  }

  depends_on = [aws_lb_listener.http]

  tags = {
    Name = "${var.project_name}-${var.environment}-api-service"
  }
}
