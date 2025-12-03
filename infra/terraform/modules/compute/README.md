<!-- BEGIN_TF_DOCS -->

## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_archive"></a> [archive](#provider\_archive) | n/a |
| <a name="provider_aws"></a> [aws](#provider\_aws) | n/a |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_acm_certificate.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate) | resource |
| [aws_acm_certificate_validation.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/acm_certificate_validation) | resource |
| [aws_appautoscaling_policy.api_cpu](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_policy.api_memory](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_policy.web_cpu](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_policy.web_memory](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_target.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_target) | resource |
| [aws_appautoscaling_target.web](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_target) | resource |
| [aws_cloudwatch_event_rule.ecs_start](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule) | resource |
| [aws_cloudwatch_event_rule.ecs_stop](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule) | resource |
| [aws_cloudwatch_event_target.ecs_start](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target) | resource |
| [aws_cloudwatch_event_target.ecs_stop](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target) | resource |
| [aws_cloudwatch_log_group.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_cloudwatch_log_group.ecs_scheduler](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_cloudwatch_log_group.web](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_ecs_cluster.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_cluster) | resource |
| [aws_ecs_service.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service) | resource |
| [aws_ecs_service.web](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service) | resource |
| [aws_ecs_task_definition.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_definition) | resource |
| [aws_ecs_task_definition.web](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_task_definition) | resource |
| [aws_iam_role.ecs_scheduler_lambda](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy.ecs_scheduler_lambda](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_lambda_function.ecs_scheduler](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function) | resource |
| [aws_lambda_permission.allow_eventbridge_start](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission) | resource |
| [aws_lambda_permission.allow_eventbridge_stop](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission) | resource |
| [aws_lb.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb) | resource |
| [aws_lb_listener.http](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener) | resource |
| [aws_lb_listener.https](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener) | resource |
| [aws_lb_listener_rule.api_http](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener_rule) | resource |
| [aws_lb_listener_rule.api_https](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_listener_rule) | resource |
| [aws_lb_target_group.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group) | resource |
| [aws_lb_target_group.web](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lb_target_group) | resource |
| [aws_route53_record.alb](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_route53_record.alb_www](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_route53_record.cert_validation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_record) | resource |
| [aws_route53_zone.main](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route53_zone) | resource |
| [aws_wafv2_web_acl_association.alb](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/wafv2_web_acl_association) | resource |
| [archive_file.ecs_scheduler](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) | data source |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |
| [aws_route53_zone.existing](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/route53_zone) | data source |
| [aws_secretsmanager_secret.datadog_api_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/secretsmanager_secret) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_alb_security_group_id"></a> [alb\_security\_group\_id](#input\_alb\_security\_group\_id) | ALB Security Group ID | `string` | n/a | yes |
| <a name="input_ecs_security_group_id"></a> [ecs\_security\_group\_id](#input\_ecs\_security\_group\_id) | ECS Security Group ID | `string` | n/a | yes |
| <a name="input_ecs_task_execution_role_arn"></a> [ecs\_task\_execution\_role\_arn](#input\_ecs\_task\_execution\_role\_arn) | ECS Task Execution Role ARN | `string` | n/a | yes |
| <a name="input_ecs_task_role_arn"></a> [ecs\_task\_role\_arn](#input\_ecs\_task\_role\_arn) | ECS Task Role ARN | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment name | `string` | n/a | yes |
| <a name="input_private_subnet_ids"></a> [private\_subnet\_ids](#input\_private\_subnet\_ids) | List of private subnet IDs | `list(string)` | n/a | yes |
| <a name="input_project_name"></a> [project\_name](#input\_project\_name) | Project name | `string` | n/a | yes |
| <a name="input_public_subnet_ids"></a> [public\_subnet\_ids](#input\_public\_subnet\_ids) | List of public subnet IDs | `list(string)` | n/a | yes |
| <a name="input_vpc_id"></a> [vpc\_id](#input\_vpc\_id) | VPC ID | `string` | n/a | yes |
| <a name="input_acm_certificate_arn"></a> [acm\_certificate\_arn](#input\_acm\_certificate\_arn) | Existing ACM certificate ARN (if not provided, will create new one) | `string` | `null` | no |
| <a name="input_acm_validation_method"></a> [acm\_validation\_method](#input\_acm\_validation\_method) | ACM certificate validation method (DNS or EMAIL) | `string` | `"DNS"` | no |
| <a name="input_api_autoscaling_cpu_threshold"></a> [api\_autoscaling\_cpu\_threshold](#input\_api\_autoscaling\_cpu\_threshold) | CPU utilization threshold for API autoscaling | `number` | `70` | no |
| <a name="input_api_autoscaling_max_capacity"></a> [api\_autoscaling\_max\_capacity](#input\_api\_autoscaling\_max\_capacity) | Maximum number of API tasks for autoscaling | `number` | `4` | no |
| <a name="input_api_autoscaling_memory_threshold"></a> [api\_autoscaling\_memory\_threshold](#input\_api\_autoscaling\_memory\_threshold) | Memory utilization threshold for API autoscaling | `number` | `80` | no |
| <a name="input_api_autoscaling_min_capacity"></a> [api\_autoscaling\_min\_capacity](#input\_api\_autoscaling\_min\_capacity) | Minimum number of API tasks for autoscaling | `number` | `1` | no |
| <a name="input_api_count"></a> [api\_count](#input\_api\_count) | Number of API tasks | `number` | `1` | no |
| <a name="input_api_cpu"></a> [api\_cpu](#input\_api\_cpu) | CPU units for API container | `number` | `256` | no |
| <a name="input_api_environment"></a> [api\_environment](#input\_api\_environment) | Environment variables for API container | <pre>list(object({<br/>    name  = string<br/>    value = string<br/>  }))</pre> | `[]` | no |
| <a name="input_api_image"></a> [api\_image](#input\_api\_image) | Docker image for API application | `string` | `"nginx:latest"` | no |
| <a name="input_api_memory"></a> [api\_memory](#input\_api\_memory) | Memory for API container in MB | `number` | `512` | no |
| <a name="input_app_version"></a> [app\_version](#input\_app\_version) | Application version for Datadog tagging | `string` | `"1.0.0"` | no |
| <a name="input_aws_region"></a> [aws\_region](#input\_aws\_region) | AWS region | `string` | `"ap-northeast-1"` | no |
| <a name="input_cloudwatch_logs_retention_days"></a> [cloudwatch\_logs\_retention\_days](#input\_cloudwatch\_logs\_retention\_days) | CloudWatch Logs retention in days | `number` | `7` | no |
| <a name="input_common_tags"></a> [common\_tags](#input\_common\_tags) | Common tags to apply to all resources | `map(string)` | `{}` | no |
| <a name="input_create_route53_zone"></a> [create\_route53\_zone](#input\_create\_route53\_zone) | Create new Route53 hosted zone (false if using existing zone) | `bool` | `false` | no |
| <a name="input_domain_name"></a> [domain\_name](#input\_domain\_name) | Custom domain name (e.g., tidilyspace.app) | `string` | `null` | no |
| <a name="input_enable_acm"></a> [enable\_acm](#input\_enable\_acm) | Enable ACM certificate for HTTPS | `bool` | `false` | no |
| <a name="input_enable_alb_deletion_protection"></a> [enable\_alb\_deletion\_protection](#input\_enable\_alb\_deletion\_protection) | Enable ALB deletion protection | `bool` | `false` | no |
| <a name="input_enable_auto_schedule"></a> [enable\_auto\_schedule](#input\_enable\_auto\_schedule) | Enable ECS auto stop/start schedule | `bool` | `false` | no |
| <a name="input_enable_autoscaling"></a> [enable\_autoscaling](#input\_enable\_autoscaling) | Enable ECS auto scaling | `bool` | `false` | no |
| <a name="input_enable_container_insights"></a> [enable\_container\_insights](#input\_enable\_container\_insights) | Enable ECS Container Insights | `bool` | `false` | no |
| <a name="input_enable_datadog"></a> [enable\_datadog](#input\_enable\_datadog) | Enable Datadog Agent sidecar | `bool` | `false` | no |
| <a name="input_enable_route53"></a> [enable\_route53](#input\_enable\_route53) | Enable Route53 for custom domain | `bool` | `false` | no |
| <a name="input_route53_zone_id"></a> [route53\_zone\_id](#input\_route53\_zone\_id) | Existing Route53 hosted zone ID (required if create\_route53\_zone is false) | `string` | `null` | no |
| <a name="input_schedule_start_cron"></a> [schedule\_start\_cron](#input\_schedule\_start\_cron) | Cron expression for starting ECS tasks (UTC). Default: 9:00 JST (0:00 UTC) on weekdays | `string` | `"cron(0 0 ? * MON-FRI *)"` | no |
| <a name="input_schedule_stop_cron"></a> [schedule\_stop\_cron](#input\_schedule\_stop\_cron) | Cron expression for stopping ECS tasks (UTC). Default: 22:00 JST (13:00 UTC) on weekdays | `string` | `"cron(0 13 ? * MON-FRI *)"` | no |
| <a name="input_use_private_subnet"></a> [use\_private\_subnet](#input\_use\_private\_subnet) | Deploy ECS tasks in private subnet (true for production) | `bool` | `false` | no |
| <a name="input_waf_web_acl_arn"></a> [waf\_web\_acl\_arn](#input\_waf\_web\_acl\_arn) | WAF Web ACL ARN from security module (optional) | `string` | `null` | no |
| <a name="input_web_autoscaling_cpu_threshold"></a> [web\_autoscaling\_cpu\_threshold](#input\_web\_autoscaling\_cpu\_threshold) | CPU utilization threshold for web autoscaling | `number` | `70` | no |
| <a name="input_web_autoscaling_max_capacity"></a> [web\_autoscaling\_max\_capacity](#input\_web\_autoscaling\_max\_capacity) | Maximum number of web tasks for autoscaling | `number` | `4` | no |
| <a name="input_web_autoscaling_memory_threshold"></a> [web\_autoscaling\_memory\_threshold](#input\_web\_autoscaling\_memory\_threshold) | Memory utilization threshold for web autoscaling | `number` | `80` | no |
| <a name="input_web_autoscaling_min_capacity"></a> [web\_autoscaling\_min\_capacity](#input\_web\_autoscaling\_min\_capacity) | Minimum number of web tasks for autoscaling | `number` | `1` | no |
| <a name="input_web_count"></a> [web\_count](#input\_web\_count) | Number of web tasks | `number` | `1` | no |
| <a name="input_web_cpu"></a> [web\_cpu](#input\_web\_cpu) | CPU units for web container | `number` | `256` | no |
| <a name="input_web_environment"></a> [web\_environment](#input\_web\_environment) | Environment variables for web container | <pre>list(object({<br/>    name  = string<br/>    value = string<br/>  }))</pre> | `[]` | no |
| <a name="input_web_image"></a> [web\_image](#input\_web\_image) | Docker image for web application | `string` | `"nginx:latest"` | no |
| <a name="input_web_memory"></a> [web\_memory](#input\_web\_memory) | Memory for web container in MB | `number` | `512` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_acm_certificate_arn"></a> [acm\_certificate\_arn](#output\_acm\_certificate\_arn) | ACM Certificate ARN |
| <a name="output_acm_certificate_status"></a> [acm\_certificate\_status](#output\_acm\_certificate\_status) | ACM Certificate validation status |
| <a name="output_alb_arn"></a> [alb\_arn](#output\_alb\_arn) | ALB ARN |
| <a name="output_alb_dns_name"></a> [alb\_dns\_name](#output\_alb\_dns\_name) | ALB DNS name |
| <a name="output_alb_zone_id"></a> [alb\_zone\_id](#output\_alb\_zone\_id) | ALB zone ID |
| <a name="output_api_service_name"></a> [api\_service\_name](#output\_api\_service\_name) | API ECS Service name |
| <a name="output_api_task_definition_arn"></a> [api\_task\_definition\_arn](#output\_api\_task\_definition\_arn) | API Task Definition ARN |
| <a name="output_domain_name"></a> [domain\_name](#output\_domain\_name) | Custom domain name |
| <a name="output_ecs_cluster_id"></a> [ecs\_cluster\_id](#output\_ecs\_cluster\_id) | ECS Cluster ID |
| <a name="output_ecs_cluster_name"></a> [ecs\_cluster\_name](#output\_ecs\_cluster\_name) | ECS Cluster name |
| <a name="output_route53_zone_id"></a> [route53\_zone\_id](#output\_route53\_zone\_id) | Route53 Hosted Zone ID |
| <a name="output_route53_zone_name_servers"></a> [route53\_zone\_name\_servers](#output\_route53\_zone\_name\_servers) | Route53 Hosted Zone Name Servers |
| <a name="output_web_service_name"></a> [web\_service\_name](#output\_web\_service\_name) | Web ECS Service name |
| <a name="output_web_task_definition_arn"></a> [web\_task\_definition\_arn](#output\_web\_task\_definition\_arn) | Web Task Definition ARN |
| <a name="output_website_url"></a> [website\_url](#output\_website\_url) | Website URL (HTTPS if enabled, otherwise ALB DNS) |

<!-- END_TF_DOCS -->