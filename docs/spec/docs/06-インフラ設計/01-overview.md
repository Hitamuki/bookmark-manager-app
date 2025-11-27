# インフラ設計概要

## 目的

本プロジェクトでは、開発フェーズに応じて最適なインフラ環境を構築します。

- **検証環境（Staging）**: 本番環境に近いコストを抑えたAWS構成
- **本番環境_商用利用前（Production - Pre-Commercial）**: コスパ重視のマネージドサービス
- **本番環境_商用利用後（Production - Commercial）**: AWS上にフルマネージドで構築する商用環境

## 環境戦略

### 検証環境（Staging）

本番環境に近いAWS構成をコストを抑えて構築し、本番リリース前の最終検証を実施します。

**主要サービス:**

- **IaC**: Terraform + Terragrunt
- **コンピューティング**: ECS on Fargate（コスト最適化）
- **ネットワーク**: VPC、ALB
- **データベース**: RDS PostgreSQL (db.t4g.micro)、MongoDB Atlas
- **モニタリング**: CloudWatch、Datadog（オプション）、Sentry

**用途:**

- 本番環境に近い構成での検証
- 負荷テスト、セキュリティテスト
- リリース前の最終確認
- コスト最適化（営業時間のみ稼働: $60〜70/月）

### 本番環境_商用利用前（Production - Pre-Commercial）

商用利用前は、コスパを重視したマネージドサービスを活用し、実際のユーザーにサービスを提供します。

**主要サービス:**

- **Web**: Vercel（Next.js最適化、CDN、自動デプロイ）
- **API**: Render（NestJS、自動スケーリング）
- **PostgreSQL**: Supabase（無料枠、バックアップ自動化）
- **MongoDB**: MongoDB Atlas（無料枠、クラスター管理）

**用途:**

- 実際のユーザーへのサービス提供
- 初期ユーザー獲得・フィードバック収集
- コスト重視（最小$0〜$68/月）

**制限事項:**

- Vercel Hobbyプランは商用利用不可のため、Proプラン以上が必要（$20/月〜）
- 無料枠を超えた場合は有料プランへの移行が必要

### 本番環境_商用利用後（Production - Commercial）

商用利用開始後は、AWS上にフルスタックで構築し、高可用性・スケーラビリティ・セキュリティを実現します。

**主要サービス:**

- **IaC**: Terraform + Terragrunt
- **コンピューティング**: ECS on Fargate
- **ネットワーク**: VPC、ALB、CloudFront
- **データベース**: Aurora PostgreSQL Serverless v2、MongoDB Atlas
- **モニタリング**: CloudWatch、Datadog、Sentry
- **セキュリティ**: WAF、IAM、Security Group

**用途:**

- 商用サービス提供
- 24時間365日稼働
- 高可用性・スケーラビリティ重視（$320〜373/月）

## インフラ管理方針

### Infrastructure as Code（IaC）

- **ツール**: Terraform + Terragrunt
- **バージョン管理**: Git
- **環境分離**: staging / production
- **モジュール化**: network / security / compute / database / storage / monitoring

### セキュリティ

- **最小権限の原則**: IAMロール・ポリシーによる厳格な権限管理
- **ネットワーク分離**: VPC、Public/Private Subnet、Security Group
- **シークレット管理**: AWS SSM Parameter Store（暗号化）
- **Web保護**: WAF（SQLインジェクション、XSS対策）
- **通信暗号化**: HTTPS/TLS、VPC Endpoint

### コスト最適化

#### 検証環境

- マネージドサービスの無料枠を最大限活用
- 従量課金制で利用量に応じた柔軟なコスト管理

#### 本番環境

- **Fargate Spot**: 本番負荷に応じたスポットインスタンス活用（将来）
- **Aurora Serverless v2**: 自動スケーリングによる最適化
- **VPC Endpoint**: NAT Gateway料金削減
- **オートスケーリング**: 夜間・休日のタスク台数自動削減
- **CloudWatch Logs**: ログ保持期間の最適化

### モニタリング・ロギング

- **APM**: Datadog（メトリクス、トレース、ログ統合）
- **エラートラッキング**: Sentry（エラー検知、アラート）
- **ログ管理**: CloudWatch Logs（本番）、各サービスのログ機能（検証）
- **アクセスログ**: ALB、CloudFront

## 移行戦略

### 検証環境での最終確認

検証環境（AWS Staging）で本番リリース前の最終確認を実施します。

1. **検証環境構築**: Terraformによる一括構築
2. **デプロイ**: GitHub ActionsによるCI/CD
3. **検証**: 負荷テスト、セキュリティテスト、E2Eテスト

### 本番環境_商用利用前（マネージドサービス）

検証が完了したら、まずはコスパ重視のマネージドサービスでサービスを開始します。

1. **本番環境構築**: Vercel、Render、Supabase、MongoDB Atlasの設定
2. **デプロイ**: Git連携による自動デプロイ
3. **初期ユーザー獲得**: 実際のユーザーへのサービス提供開始
4. **フィードバック収集**: ユーザーからのフィードバックを基に改善

### 本番環境_商用利用後（AWS）への移行

商用利用を本格化する際は、AWS環境へ移行します。

1. **本番環境構築**: Terraformによる一括構築
2. **データ移行**:
   - Supabase → Aurora PostgreSQL
   - MongoDB Atlas（商用利用前） → MongoDB Atlas（商用利用後）
3. **DNS切り替え**: Route53による段階的なトラフィック移行
4. **検証期間**: カナリアリリース、A/Bテスト
5. **完全移行**: マネージドサービスの縮小、検証環境は維持

## 環境比較表

| 項目 | 検証環境 | 本番_商用利用前 | 本番_商用利用後 |
|------|---------|----------------|----------------|
| **ホスティング** | AWS ECS | Vercel/Render | AWS ECS |
| **DB（PostgreSQL）** | RDS PostgreSQL | Supabase | Aurora Serverless v2 |
| **DB（MongoDB）** | MongoDB Atlas (M0/M10) | MongoDB Atlas (M0) | MongoDB Atlas (M10〜) |
| **CDN** | - | Vercel Edge | CloudFront |
| **WAF** | - | - | WAF |
| **モニタリング** | CloudWatch, Sentry | 各サービス標準 | CloudWatch, Datadog, Sentry |
| **稼働時間** | 営業時間のみ | 24時間 | 24時間365日 |
| **月額コスト** | $60〜70 | $0〜68 | $320〜373 |
| **用途** | 検証・テスト | 初期ユーザー獲得 | 商用サービス |

## 参考資料

- [検証環境](02-staging.md)
- [本番環境_商用利用前](03-production-pre-commercial.md)
- [本番環境_商用利用後](04-production-commercial.md)
- [ネットワーク](05-network.md)
- [セキュリティ](06-security.md)
- [モニタリング](07-monitoring.md)
