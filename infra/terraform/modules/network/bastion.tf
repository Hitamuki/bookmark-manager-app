# ============================================================
# Bastion Host (EC2 Instance)
# ============================================================
# RDSへの接続用の踏み台サーバー
# SSM Session Manager経由でアクセス可能

# 最新のAmazon Linux 2023 AMIを取得
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Bastion用のIAMロール
resource "aws_iam_role" "bastion" {
  name = "${var.project_name}-${var.environment}-bastion-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-bastion-role"
  }
}

# SSM Session Manager用のポリシーをアタッチ
resource "aws_iam_role_policy_attachment" "bastion_ssm" {
  role       = aws_iam_role.bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# IAMインスタンスプロファイル
resource "aws_iam_instance_profile" "bastion" {
  name = "${var.project_name}-${var.environment}-bastion-profile"
  role = aws_iam_role.bastion.name

  tags = {
    Name = "${var.project_name}-${var.environment}-bastion-profile"
  }
}

# Bastion Security Group
resource "aws_security_group" "bastion" {
  count = var.enable_bastion ? 1 : 0

  name        = "${var.project_name}-${var.environment}-bastion-sg"
  description = "Security group for Bastion host"
  vpc_id      = aws_vpc.main.id

  # SSM Session Manager (アウトバウンドのみでOK)
  # SSM Session Managerはアウトバウンド接続のみを使用するため、
  # インバウンドルールは不要

  # Outbound
  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-bastion-sg"
  }
}

# Bastion EC2インスタンス
resource "aws_instance" "bastion" {
  count = var.enable_bastion ? 1 : 0

  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.bastion_instance_type
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.bastion[0].id]
  iam_instance_profile   = aws_iam_instance_profile.bastion.name

  # SSM Session Manager経由でのアクセスのみを許可するため、
  # キーペアは不要
  # key_name = ""

  # SSM Agentを起動してSession Managerを有効化
  # Amazon Linux 2023にはSSM Agentがプリインストール済みのため、
  # 確実に起動・有効化するための最小限のスクリプト
  user_data = <<-EOF
    #!/bin/bash
    set -x
    exec > >(tee /var/log/user-data.log) 2>&1

    # SSM Agentを有効化して起動
    systemctl enable amazon-ssm-agent
    systemctl restart amazon-ssm-agent

    # 起動確認（ログ出力用）
    systemctl is-active amazon-ssm-agent

    echo "User data script completed at $(date)"
  EOF

  # EBSボリューム設定（Amazon Linux 2023の最小サイズ）
  root_block_device {
    volume_size           = 30  # GB（Amazon Linux 2023のスナップショットサイズに準拠）
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  # メタデータサービスv2を強制（セキュリティ強化）
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-bastion"
  }

  lifecycle {
    ignore_changes = [ami]
  }
}
