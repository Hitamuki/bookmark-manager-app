# ============================================================
# Compute Module Configuration for Production
# ============================================================

include "root" {
  path = find_in_parent_folders("root.hcl")
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

terraform {
  source = "../../../modules/compute"
}

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
    waf_web_acl_arn             = null
  }
}

dependency "ecr" {
  config_path = "../ecr"

  mock_outputs = {
    web_repository_url = "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-web"
    api_repository_url = "123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/bookmark-manager-prod-api"
  }
}

dependency "monitoring" {
  config_path = "../monitoring"

  mock_outputs = {
    sentry_dsn = "https://mock@sentry.io/0"
  }
}

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
  waf_web_acl_arn             = dependency.security.outputs.waf_web_acl_arn

  # Web (Next.js) コンテナ設定（本番環境）
  web_cpu    = 1024 # 1 vCPU
  web_memory = 2048 # 2048 MB
  web_count  = 1    # 初期1タスク（コスト優先、Auto Scalingで自動増減）
  web_image  = "${dependency.ecr.outputs.web_repository_url}:latest"

  # 環境変数
  web_environment = [
    {
      name  = "NODE_ENV"
      value = "production"
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

  # API (NestJS) コンテナ設定（本番環境）
  api_cpu    = 1024 # 1 vCPU
  api_memory = 2048 # 2048 MB
  api_count  = 1    # 初期1タスク（コスト優先、Auto Scalingで自動増減）
  api_image  = "${dependency.ecr.outputs.api_repository_url}:latest"

  # 環境変数
  api_environment = [
    {
      name  = "NODE_ENV"
      value = "production"
    },
    {
      name  = "PORT"
      value = "3001"
    }
  ]

  # ECS自動停止/起動設定（本番環境では無効化）
  enable_auto_schedule = false

  # オートスケーリング設定（本番環境で有効化）
  enable_autoscaling = true

  # Webオートスケーリング設定
  web_autoscaling_min_capacity     = 1  # 最小1タスク（コスト優先）
  web_autoscaling_max_capacity     = 10 # 最大10タスク
  web_autoscaling_cpu_threshold    = 70 # CPU 70%でスケールアウト
  web_autoscaling_memory_threshold = 80 # メモリ 80%でスケールアウト

  # APIオートスケーリング設定
  api_autoscaling_min_capacity     = 1  # 最小1タスク（コスト優先）
  api_autoscaling_max_capacity     = 10 # 最大10タスク
  api_autoscaling_cpu_threshold    = 70 # CPU 70%でスケールアウト
  api_autoscaling_memory_threshold = 80 # メモリ 80%でスケールアウト

  # Datadog監視設定（本番環境では推奨）
  enable_datadog = true
  app_version    = "1.0.0"

  # CloudWatch Logs保持期間（本番環境）
  cloudwatch_logs_retention_days = 30

  # ALB削除保護（本番環境）
  enable_alb_deletion_protection = true

  # Container Insights（本番環境で有効化）
  enable_container_insights = true

  # ECS配置先（本番環境: プライベートサブネット）
  use_private_subnet = true

  # ============================================================
  # Route53 & ACM設定（HTTPS化）
  # ============================================================

  # Route53有効化
  enable_route53 = true

  # ドメイン名
  # TODO: 将来的に tidilyhub.app に変更する可能性あり
  domain_name = "tidilyspace.app"

  # Route53ホストゾーン作成（新規の場合はtrue、既存の場合はfalse）
  # 初回デプロイ時: true（新規作成）
  # 2回目以降: falseに変更してroute53_zone_idを指定
  create_route53_zone = true

  # 既存のRoute53ホストゾーンID（create_route53_zone=falseの場合に指定）
  # 初回デプロイ後、ここにホストゾーンIDを記載してcreate_route53_zone=falseに変更
  # route53_zone_id = "Z1234567890ABC"

  # ACM証明書有効化（HTTPS化）
  enable_acm = true

  # ACM証明書の検証方法（DNS推奨）
  acm_validation_method = "DNS"

  # 既存のACM証明書ARN（オプション）
  # 既に証明書がある場合はここに指定
  # acm_certificate_arn = "arn:aws:acm:ap-northeast-1:123456789012:certificate/xxxxx"
}
