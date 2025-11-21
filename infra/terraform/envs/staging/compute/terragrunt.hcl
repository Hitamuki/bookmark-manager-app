# ============================================================
# Compute Module Configuration for Staging
# ============================================================
# ECS Fargate、ALB、タスク定義を構築します。

# ルート設定の継承
include "root" {
  path = find_in_parent_folders("root.hcl")
}

# 親環境設定の継承
include "env" {
  path = find_in_parent_folders("env.hcl")
}

# Terraformモジュールのソースパス
terraform {
  source = "../../../modules/compute"
}

# 依存モジュール
dependency "network" {
  config_path = "../network"

  mock_outputs = {
    vpc_id             = "vpc-mock-id"
    public_subnet_ids  = ["subnet-mock-public-1", "subnet-mock-public-2"]
    private_subnet_ids = ["subnet-mock-private-1", "subnet-mock-private-2"]
  }
}

dependency "security" {
  config_path = "../security"

  mock_outputs = {
    alb_security_group_id       = "sg-mock-alb"
    ecs_security_group_id       = "sg-mock-ecs"
    ecs_task_execution_role_arn = "arn:aws:iam::123456789012:role/mock-execution-role"
    ecs_task_role_arn           = "arn:aws:iam::123456789012:role/mock-task-role"
  }
}

dependency "ecr" {
  config_path = "../ecr"

  mock_outputs = {
    web_repository_url = "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-staging-web"
    api_repository_url = "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-staging-api"
  }
}


dependency "monitoring" {
  config_path = "../monitoring"

  mock_outputs = {
    sentry_dsn = "https://mock@sentry.io/0"
  }
}

# モジュール固有の変数
inputs = {
  # ネットワーク設定（networkモジュールから取得）
  vpc_id             = dependency.network.outputs.vpc_id
  public_subnet_ids  = dependency.network.outputs.public_subnet_ids
  private_subnet_ids = dependency.network.outputs.private_subnet_ids

  # セキュリティ設定（securityモジュールから取得）
  alb_security_group_id       = dependency.security.outputs.alb_security_group_id
  ecs_security_group_id       = dependency.security.outputs.ecs_security_group_id
  ecs_task_execution_role_arn = dependency.security.outputs.ecs_task_execution_role_arn
  ecs_task_role_arn           = dependency.security.outputs.ecs_task_role_arn

  # Web (Next.js) コンテナ設定（コスト最適化）
  # Datadog Agentサイドカー追加のため、CPU/メモリを増加
  # Fargate制約: CPU 256では512/1024/2048MBのみ有効
  web_cpu    = 512  # 0.5 vCPU (Datadog Agent必要)
  web_memory = 1024 # 1024 MB (Webコンテナ768MB + Datadog Agent 256MB)
  web_count  = 1    # 1タスク
  web_image  = "${dependency.ecr.outputs.web_repository_url}:latest"

  # 環境変数（必要に応じて追加）
  # 注: API_URLは動的に設定されます（fargate_task.tfで自動追加）
  web_environment = [
    {
      name  = "NODE_ENV"
      value = "staging"
    },
    {
      name  = "PORT"
      value = "3000"
    },
    {
      name  = "NEXT_PUBLIC_SENTRY_DSN"
      value = dependency.monitoring.outputs.sentry_dsn
    }
  ]

  # API (NestJS) コンテナ設定（コスト最適化）
  # Datadog Agentサイドカー追加のため、CPU/メモリを増加
  # Fargate制約: CPU 256では512/1024/2048MBのみ有効
  api_cpu    = 512  # 0.5 vCPU (Datadog Agent必要)
  api_memory = 1024 # 1024 MB (APIコンテナ768MB + Datadog Agent 256MB)
  api_count  = 1    # 1タスク
  api_image  = "${dependency.ecr.outputs.api_repository_url}:latest"

  # 環境変数（必要に応じて追加）
  # 注: ALLOWED_ORIGINSは動的に設定されます（fargate_task.tfで自動追加）
  api_environment = [
    {
      name  = "NODE_ENV"
      value = "staging"
    },
    {
      name  = "PORT"
      value = "3001"
    }
  ]

  # ECS自動停止/起動設定（コスト削減）
  enable_auto_schedule = true
  schedule_start_cron  = "cron(0 0 ? * MON-FRI *)"  # 月〜金 9:00 JST (0:00 UTC)
  schedule_stop_cron   = "cron(0 13 ? * MON-FRI *)" # 月〜金 22:00 JST (13:00 UTC)

  # Datadog監視設定
  enable_datadog = true
  app_version    = "1.0.0"
}
