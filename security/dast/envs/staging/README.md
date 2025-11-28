# DAST - Staging Environment

このディレクトリには、Staging環境に対するOWASP ZAPを使用したDASTテストの設定とスクリプトが含まれています。

## 環境情報

- **対象URL**: `http://bookmark-manager-staging-alb-2010620542.ap-northeast-1.elb.amazonaws.com`
- **環境**: Staging（開発・テスト用）
- **アクセス制限**: IPアドレス制限あり
- **稼働時間**: 平日 9:00-22:00 JST

## 使用方法

### 1. セキュリティグループの設定

Staging環境のALBは、特定のIPアドレスからのアクセスのみを許可しています。

```bash
# 自分のIPアドレスを追加
./manage-security-group.sh add

# テスト完了後、IPアドレスを削除
./manage-security-group.sh remove
```

### 2. ZAPスキャンの実行

```bash
# ベースラインスキャン（推奨）
./run-zap-scan.sh

# フルスキャン（能動的攻撃を含む）
./run-zap-scan.sh -m full

# カスタムURL指定
./run-zap-scan.sh -t http://bookmark-manager-staging-alb-2010620542.ap-northeast-1.elb.amazonaws.com/api
```

### 3. Docker Composeでの実行

```bash
# デフォルト設定で実行
docker compose up

# カスタムURL指定
TARGET_URL=http://example.com/ docker compose up
```

## レポート

スキャン結果は `reports/` ディレクトリに以下の形式で生成されます。

- `zap-baseline-report-YYYYMMDD-HHMMSS.html` - HTMLレポート
- `zap-baseline-report-YYYYMMDD-HHMMSS.json` - JSONレポート
- `zap-baseline-report-YYYYMMDD-HHMMSS.md` - Markdownレポート
- `zap-baseline-report-YYYYMMDD-HHMMSS.xml` - XMLレポート

## 設定ファイル

- [zap-baseline-config.yaml](zap-baseline-config.yaml) - ZAPスキャン設定
- [docker-compose.yml](docker-compose.yml) - Docker Compose設定
- [run-zap-scan.sh](run-zap-scan.sh) - スキャン実行スクリプト
- [manage-security-group.sh](manage-security-group.sh) - セキュリティグループ管理スクリプト

## 注意事項

- ECSタスクが起動していることを確認してください
- セキュリティグループでIPアドレスを許可してください
- フルスキャンは能動的攻撃を含むため、慎重に実行してください
