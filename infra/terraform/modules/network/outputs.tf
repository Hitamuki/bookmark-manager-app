output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = aws_nat_gateway.main[*].id
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}

output "bastion_instance_id" {
  description = "Bastion EC2 Instance ID"
  value       = var.enable_bastion ? aws_instance.bastion[0].id : null
}

output "bastion_instance_private_ip" {
  description = "Bastion EC2 Instance Private IP"
  value       = var.enable_bastion ? aws_instance.bastion[0].private_ip : null
}

output "bastion_security_group_id" {
  description = "Bastion Security Group ID"
  value       = var.enable_bastion ? aws_security_group.bastion[0].id : null
}
