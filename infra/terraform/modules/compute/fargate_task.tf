# Datadog API Keyの参照（Secrets Manager）
data "aws_secretsmanager_secret" "datadog_api_key" {
  count = var.enable_datadog ? 1 : 0
  name  = "datadog/api_key"
}

# ECS Task Definition for Web (Next.js)
resource "aws_ecs_task_definition" "web" {
  family                   = "${var.project_name}-${var.environment}-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.web_cpu
  memory                   = var.web_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode(concat([
    {
      name      = "web"
      image     = var.web_image
      essential = true

      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]

      environment = concat(
        var.web_environment,
        [
          {
            name  = "API_URL"
            value = "http://${aws_lb.main.dns_name}"
          }
        ],
        var.enable_datadog ? [
          {
            name  = "DD_ENV"
            value = var.environment
          },
          {
            name  = "DD_SERVICE"
            value = "${var.project_name}-web"
          },
          {
            name  = "DD_VERSION"
            value = var.app_version
          },
          {
            name  = "DD_TRACE_AGENT_URL"
            value = "http://localhost:8126"
          },
          {
            name  = "DD_TRACE_SAMPLING_RULES"
            value = "[{\"sample_rate\":0.2}]"
          },
          {
            name  = "DD_TRACE_RATE_LIMIT"
            value = "50"
          },
          {
            name  = "DD_TRACE_LOG_LEVEL"
            value = "error"
          }
        ] : []
      )

      # SSM Parameter Storeから機密情報を取得
      secrets = [
        {
          name      = "SENTRY_DSN"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/${var.environment}/SENTRY_DSN"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.web.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ], var.enable_datadog ? [{
    name      = "datadog-agent"
    image     = "public.ecr.aws/datadog/agent:latest"
    essential = false

    secrets = [
      {
        name      = "DD_API_KEY"
        valueFrom = data.aws_secretsmanager_secret.datadog_api_key[0].arn
      }
    ]

    environment = [
      {
        name  = "ECS_FARGATE"
        value = "true"
      },
      {
        name  = "DD_SITE"
        value = "ap1.datadoghq.com"
      },
      {
        name  = "DD_APM_ENABLED"
        value = "true"
      },
      {
        name  = "DD_APM_NON_LOCAL_TRAFFIC"
        value = "true"
      },
      {
        name  = "DD_LOGS_ENABLED"
        value = "true"
      },
      {
        name  = "DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL"
        value = "true"
      }
    ]

    portMappings = [
      {
        containerPort = 8126
        protocol      = "tcp"
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.web.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "datadog"
      }
    }
  }] : []))

  tags = {
    Name = "${var.project_name}-${var.environment}-web-task"
  }
}

# ECS Task Definition for API (NestJS)
resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-${var.environment}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = var.ecs_task_execution_role_arn
  task_role_arn            = var.ecs_task_role_arn

  container_definitions = jsonencode(concat([
    {
      name      = "api"
      image     = var.api_image
      essential = true

      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      environment = concat(
        var.api_environment,
        [
          {
            name  = "ALLOWED_ORIGINS"
            value = "http://${aws_lb.main.dns_name}"
          }
        ],
        var.enable_datadog ? [
          {
            name  = "DD_ENV"
            value = var.environment
          },
          {
            name  = "DD_SERVICE"
            value = "${var.project_name}-api"
          },
          {
            name  = "DD_VERSION"
            value = var.app_version
          },
          {
            name  = "DD_TRACE_AGENT_URL"
            value = "http://localhost:8126"
          },
          {
            name  = "DD_TRACE_SAMPLING_RULES"
            value = "[{\"sample_rate\":0.2}]"
          },
          {
            name  = "DD_TRACE_RATE_LIMIT"
            value = "50"
          },
          {
            name  = "DD_TRACE_LOG_LEVEL"
            value = "error"
          }
        ] : []
      )

      # SSM Parameter Storeから機密情報を取得
      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/${var.environment}/DATABASE_URL"
        },
        {
          name      = "MONGODB_URI"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/${var.environment}/MONGODB_URI"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ], var.enable_datadog ? [{
    name      = "datadog-agent"
    image     = "public.ecr.aws/datadog/agent:latest"
    essential = false

    secrets = [
      {
        name      = "DD_API_KEY"
        valueFrom = data.aws_secretsmanager_secret.datadog_api_key[0].arn
      }
    ]

    environment = [
      {
        name  = "ECS_FARGATE"
        value = "true"
      },
      {
        name  = "DD_SITE"
        value = "ap1.datadoghq.com"
      },
      {
        name  = "DD_APM_ENABLED"
        value = "true"
      },
      {
        name  = "DD_APM_NON_LOCAL_TRAFFIC"
        value = "true"
      },
      {
        name  = "DD_LOGS_ENABLED"
        value = "true"
      },
      {
        name  = "DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL"
        value = "true"
      }
    ]

    portMappings = [
      {
        containerPort = 8126
        protocol      = "tcp"
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "datadog"
      }
    }
  }] : []))

  tags = {
    Name = "${var.project_name}-${var.environment}-api-task"
  }
}

# Data sources
data "aws_region" "current" {}
data "aws_caller_identity" "current" {}
