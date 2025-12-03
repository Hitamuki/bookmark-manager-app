<!-- BEGIN_TF_DOCS -->

## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | n/a |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_s3_bucket.assets](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket) | resource |
| [aws_s3_bucket_cors_configuration.assets](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_cors_configuration) | resource |
| [aws_s3_bucket_lifecycle_configuration.assets](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_lifecycle_configuration) | resource |
| [aws_s3_bucket_public_access_block.assets](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_public_access_block) | resource |
| [aws_s3_bucket_server_side_encryption_configuration.assets](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_server_side_encryption_configuration) | resource |
| [aws_s3_bucket_versioning.assets](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_versioning) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_environment"></a> [environment](#input\_environment) | Environment name | `string` | n/a | yes |
| <a name="input_project_name"></a> [project\_name](#input\_project\_name) | Project name | `string` | n/a | yes |
| <a name="input_cors_allowed_origins"></a> [cors\_allowed\_origins](#input\_cors\_allowed\_origins) | Allowed origins for CORS | `list(string)` | <pre>[<br/>  "*"<br/>]</pre> | no |
| <a name="input_enable_versioning"></a> [enable\_versioning](#input\_enable\_versioning) | Enable S3 bucket versioning | `bool` | `false` | no |
| <a name="input_lifecycle_rules"></a> [lifecycle\_rules](#input\_lifecycle\_rules) | S3 lifecycle rules | <pre>object({<br/>    transition_to_ia_days = number<br/>    expiration_days       = number<br/>  })</pre> | <pre>{<br/>  "expiration_days": 365,<br/>  "transition_to_ia_days": 90<br/>}</pre> | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_assets_bucket_arn"></a> [assets\_bucket\_arn](#output\_assets\_bucket\_arn) | S3 assets bucket ARN |
| <a name="output_assets_bucket_domain_name"></a> [assets\_bucket\_domain\_name](#output\_assets\_bucket\_domain\_name) | S3 assets bucket domain name |
| <a name="output_assets_bucket_id"></a> [assets\_bucket\_id](#output\_assets\_bucket\_id) | S3 assets bucket ID |
| <a name="output_assets_bucket_name"></a> [assets\_bucket\_name](#output\_assets\_bucket\_name) | S3 assets bucket name |
| <a name="output_assets_bucket_regional_domain_name"></a> [assets\_bucket\_regional\_domain\_name](#output\_assets\_bucket\_regional\_domain\_name) | S3 assets bucket regional domain name |

<!-- END_TF_DOCS -->