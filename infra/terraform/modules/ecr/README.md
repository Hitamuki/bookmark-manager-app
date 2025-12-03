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
| [aws_ecr_lifecycle_policy.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_lifecycle_policy) | resource |
| [aws_ecr_lifecycle_policy.web](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_lifecycle_policy) | resource |
| [aws_ecr_repository.api](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository) | resource |
| [aws_ecr_repository.web](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecr_repository) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_environment"></a> [environment](#input\_environment) | Environment name | `string` | n/a | yes |
| <a name="input_project_name"></a> [project\_name](#input\_project\_name) | Project name | `string` | n/a | yes |
| <a name="input_force_delete"></a> [force\_delete](#input\_force\_delete) | If true, will delete the repository even if it contains images | `bool` | `false` | no |
| <a name="input_image_tag_mutability"></a> [image\_tag\_mutability](#input\_image\_tag\_mutability) | The tag mutability setting for the repository (MUTABLE or IMMUTABLE) | `string` | `"MUTABLE"` | no |
| <a name="input_max_image_count"></a> [max\_image\_count](#input\_max\_image\_count) | Maximum number of images to keep in the repository | `number` | `10` | no |
| <a name="input_scan_on_push"></a> [scan\_on\_push](#input\_scan\_on\_push) | Indicates whether images are scanned after being pushed to the repository | `bool` | `true` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_api_repository_arn"></a> [api\_repository\_arn](#output\_api\_repository\_arn) | API application repository ARN |
| <a name="output_api_repository_name"></a> [api\_repository\_name](#output\_api\_repository\_name) | API application repository name |
| <a name="output_api_repository_url"></a> [api\_repository\_url](#output\_api\_repository\_url) | API application repository URL |
| <a name="output_web_repository_arn"></a> [web\_repository\_arn](#output\_web\_repository\_arn) | Web application repository ARN |
| <a name="output_web_repository_name"></a> [web\_repository\_name](#output\_web\_repository\_name) | Web application repository name |
| <a name="output_web_repository_url"></a> [web\_repository\_url](#output\_web\_repository\_url) | Web application repository URL |

<!-- END_TF_DOCS -->