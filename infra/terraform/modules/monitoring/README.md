<!-- BEGIN_TF_DOCS -->

## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 5.0 |
| <a name="requirement_datadog"></a> [datadog](#requirement\_datadog) | ~> 3.0 |
| <a name="requirement_sentry"></a> [sentry](#requirement\_sentry) | ~> 0.9 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | ~> 5.0 |
| <a name="provider_datadog"></a> [datadog](#provider\_datadog) | ~> 3.0 |
| <a name="provider_sentry"></a> [sentry](#provider\_sentry) | ~> 0.9 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_ssm_parameter.sentry_dsn](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [datadog_dashboard.bookmark_manager](https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/dashboard) | resource |
| [datadog_monitor.api_error_rate](https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/monitor) | resource |
| [datadog_monitor.api_latency](https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/monitor) | resource |
| [datadog_monitor.rds_cpu](https://registry.terraform.io/providers/DataDog/datadog/latest/docs/resources/monitor) | resource |
| [sentry_issue_alert.critical_errors](https://registry.terraform.io/providers/jianyuan/sentry/latest/docs/resources/issue_alert) | resource |
| [sentry_key.web](https://registry.terraform.io/providers/jianyuan/sentry/latest/docs/resources/key) | resource |
| [sentry_project.web](https://registry.terraform.io/providers/jianyuan/sentry/latest/docs/resources/project) | resource |
| [aws_secretsmanager_secret.datadog_api_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/secretsmanager_secret) | data source |
| [aws_secretsmanager_secret.datadog_app_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/secretsmanager_secret) | data source |
| [aws_secretsmanager_secret.sentry_auth_token](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/secretsmanager_secret) | data source |
| [aws_secretsmanager_secret_version.datadog_api_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/secretsmanager_secret_version) | data source |
| [aws_secretsmanager_secret_version.datadog_app_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/secretsmanager_secret_version) | data source |
| [aws_secretsmanager_secret_version.sentry_auth_token](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/secretsmanager_secret_version) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_alert_email"></a> [alert\_email](#input\_alert\_email) | Email address for alerts | `string` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | Environment name (staging, production) | `string` | n/a | yes |
| <a name="input_project_name"></a> [project\_name](#input\_project\_name) | Project name | `string` | n/a | yes |
| <a name="input_sentry_organization"></a> [sentry\_organization](#input\_sentry\_organization) | Sentry organization slug | `string` | n/a | yes |
| <a name="input_sentry_team"></a> [sentry\_team](#input\_sentry\_team) | Sentry team slug | `string` | n/a | yes |
| <a name="input_aws_region"></a> [aws\_region](#input\_aws\_region) | AWS region | `string` | `"ap-northeast-1"` | no |
| <a name="input_tags"></a> [tags](#input\_tags) | Common tags to apply to all resources | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_datadog_api_key_secret_arn"></a> [datadog\_api\_key\_secret\_arn](#output\_datadog\_api\_key\_secret\_arn) | ARN of Datadog API Key in Secrets Manager |
| <a name="output_datadog_dashboard_url"></a> [datadog\_dashboard\_url](#output\_datadog\_dashboard\_url) | Datadog dashboard URL |
| <a name="output_datadog_monitors"></a> [datadog\_monitors](#output\_datadog\_monitors) | Datadog monitor IDs |
| <a name="output_sentry_dsn"></a> [sentry\_dsn](#output\_sentry\_dsn) | Sentry DSN (Public) |
| <a name="output_sentry_dsn_parameter_name"></a> [sentry\_dsn\_parameter\_name](#output\_sentry\_dsn\_parameter\_name) | SSM Parameter Store name for Sentry DSN |
| <a name="output_sentry_project_id"></a> [sentry\_project\_id](#output\_sentry\_project\_id) | Sentry project ID |

<!-- END_TF_DOCS -->