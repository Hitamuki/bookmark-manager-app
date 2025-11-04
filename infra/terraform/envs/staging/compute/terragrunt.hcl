# ============================================================
# Compute Module Configuration for Staging
# ============================================================
# ECS Fargate、ALB、タスク定義を構築します。

# 環境設定の継承
include "root" {
  path = find_in_parent_folders("root.hcl")
}

# Terraformモジュールのソースパス
terraform {
  source = "../../../modules/compute"
}

# 依存モジュール
dependency "network" {
  config_path = "../network"

  mock_outputs = {
    vpc_id              = "vpc-mock-id"
    public_subnet_ids   = ["subnet-mock-public-1", "subnet-mock-public-2"]
    private_subnet_ids  = ["subnet-mock-private-1", "subnet-mock-private-2"]
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

# モジュール固有の変数
inputs = {
  # ネットワーク設定（networkモジュールから取得）
  vpc_id              = dependency.network.outputs.vpc_id
  public_subnet_ids   = dependency.network.outputs.public_subnet_ids
  private_subnet_ids  = dependency.network.outputs.private_subnet_ids

  # セキュリティ設定（securityモジュールから取得）
  alb_security_group_id       = dependency.security.outputs.alb_security_group_id
  ecs_security_group_id       = dependency.security.outputs.ecs_security_group_id
  ecs_task_execution_role_arn = dependency.security.outputs.ecs_task_execution_role_arn
  ecs_task_role_arn           = dependency.security.outputs.ecs_task_role_arn

  # Web (Next.js) コンテナ設定（コスト最適化）
  web_cpu    = 256  # 0.25 vCPU
  web_memory = 512  # 512 MB
  web_count  = 1    # 1タスク
  web_image  = "${dependency.ecr.outputs.web_repository_url}:latest"

  # 環境変数（必要に応じて追加）
  web_environment = [
    {
      name  = "NODE_ENV"
      value = "staging"
    },
    {
      name  = "PORT"
      value = "3000"
    }
  ]

  # API (NestJS) コンテナ設定（コスト最適化）
  api_cpu    = 256  # 0.25 vCPU
  api_memory = 512  # 512 MB
  api_count  = 1    # 1タスク
  api_image  = "${dependency.ecr.outputs.api_repository_url}:latest"

  # 環境変数（必要に応じて追加）
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
}
