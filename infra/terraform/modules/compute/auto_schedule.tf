# ============================================================
# ECS Auto Scheduler (月〜金 9:00-22:00 JST 稼働)
# ============================================================

# Lambda関数のアーカイブ作成
# 注意: Lambda関数はTypeScriptで記述されていますが、デプロイ前に
# JavaScriptにトランスパイルする必要があります。
# 手順: cd infra/terraform/modules/compute/lambda && npx esbuild ecs_scheduler.ts --bundle --platform=node --target=node22 --outfile=ecs_scheduler.js
data "archive_file" "ecs_scheduler" {
  count       = var.enable_auto_schedule ? 1 : 0
  type        = "zip"
  source_file = "${path.module}/lambda/ecs_scheduler.js"
  output_path = "${path.module}/lambda/ecs_scheduler.zip"
}

# Lambda IAMロール
resource "aws_iam_role" "ecs_scheduler_lambda" {
  count = var.enable_auto_schedule ? 1 : 0
  name  = "${var.project_name}-${var.environment}-ecs-scheduler-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ecs-scheduler-lambda-role"
    }
  )
}

# Lambda IAMポリシー (ECS更新権限)
resource "aws_iam_role_policy" "ecs_scheduler_lambda" {
  count = var.enable_auto_schedule ? 1 : 0
  name  = "${var.project_name}-${var.environment}-ecs-scheduler-policy"
  role  = aws_iam_role.ecs_scheduler_lambda[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:UpdateService",
          "ecs:DescribeServices"
        ]
        Resource = [
          aws_ecs_service.web.id,
          aws_ecs_service.api.id
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:*:log-group:/aws/lambda/${var.project_name}-${var.environment}-ecs-scheduler:*"
      }
    ]
  })
}

# Lambda関数
resource "aws_lambda_function" "ecs_scheduler" {
  count            = var.enable_auto_schedule ? 1 : 0
  filename         = data.archive_file.ecs_scheduler[0].output_path
  function_name    = "${var.project_name}-${var.environment}-ecs-scheduler"
  role             = aws_iam_role.ecs_scheduler_lambda[0].arn
  handler          = "ecs_scheduler.handler"
  source_code_hash = data.archive_file.ecs_scheduler[0].output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 60
  memory_size      = 128

  environment {
    variables = {
      CLUSTER_NAME      = aws_ecs_cluster.main.name
      WEB_SERVICE_NAME  = aws_ecs_service.web.name
      API_SERVICE_NAME  = aws_ecs_service.api.name
      DESIRED_COUNT     = var.web_count
      ECS_REGION        = var.aws_region
    }
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ecs-scheduler"
    }
  )
}

# CloudWatch Logs (Lambda)
resource "aws_cloudwatch_log_group" "ecs_scheduler" {
  count             = var.enable_auto_schedule ? 1 : 0
  name              = "/aws/lambda/${var.project_name}-${var.environment}-ecs-scheduler"
  retention_in_days = var.environment == "production" ? 30 : 7

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ecs-scheduler-logs"
    }
  )
}

# EventBridge Rule - ECS起動 (月〜金 9:00 JST = 0:00 UTC)
resource "aws_cloudwatch_event_rule" "ecs_start" {
  count               = var.enable_auto_schedule ? 1 : 0
  name                = "${var.project_name}-${var.environment}-ecs-start"
  description         = "Start ECS tasks on weekdays at 9:00 JST (0:00 UTC)"
  schedule_expression = var.schedule_start_cron

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ecs-start-rule"
    }
  )
}

# EventBridge Target - ECS起動
resource "aws_cloudwatch_event_target" "ecs_start" {
  count     = var.enable_auto_schedule ? 1 : 0
  rule      = aws_cloudwatch_event_rule.ecs_start[0].name
  target_id = "ecs-scheduler-lambda"
  arn       = aws_lambda_function.ecs_scheduler[0].arn

  input = jsonencode({
    action = "start"
  })
}

# Lambda権限 - EventBridge起動用
resource "aws_lambda_permission" "allow_eventbridge_start" {
  count         = var.enable_auto_schedule ? 1 : 0
  statement_id  = "AllowExecutionFromEventBridgeStart"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ecs_scheduler[0].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ecs_start[0].arn
}

# EventBridge Rule - ECS停止 (月〜金 22:00 JST = 13:00 UTC)
resource "aws_cloudwatch_event_rule" "ecs_stop" {
  count               = var.enable_auto_schedule ? 1 : 0
  name                = "${var.project_name}-${var.environment}-ecs-stop"
  description         = "Stop ECS tasks on weekdays at 22:00 JST (13:00 UTC)"
  schedule_expression = var.schedule_stop_cron

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ecs-stop-rule"
    }
  )
}

# EventBridge Target - ECS停止
resource "aws_cloudwatch_event_target" "ecs_stop" {
  count     = var.enable_auto_schedule ? 1 : 0
  rule      = aws_cloudwatch_event_rule.ecs_stop[0].name
  target_id = "ecs-scheduler-lambda"
  arn       = aws_lambda_function.ecs_scheduler[0].arn

  input = jsonencode({
    action = "stop"
  })
}

# Lambda権限 - EventBridge停止用
resource "aws_lambda_permission" "allow_eventbridge_stop" {
  count         = var.enable_auto_schedule ? 1 : 0
  statement_id  = "AllowExecutionFromEventBridgeStop"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ecs_scheduler[0].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ecs_stop[0].arn
}
