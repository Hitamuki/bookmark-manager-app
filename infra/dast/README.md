# DAST (Dynamic Application Security Testing)

このディレクトリには、OWASP ZAPを使用したDASTテストの設定とスクリプトが含まれています。

## 概要

OWASP ZAPは、Webアプリケーションの脆弱性を検出するための動的アプリケーションセキュリティテストツールです。
このプロジェクトでは、Staging環境に対してDASTテストを実行し、セキュリティリスクを早期に発見します。

## ファイル構成

``` txt
infra/dast/
├── README.md                      # このファイル
├── zap-baseline-config.yaml       # ZAPベースラインスキャン設定
├── docker-compose.yml             # Docker Compose設定（オプション）
├── run-zap-scan.sh                # ZAPスキャン実行スクリプト
├── manage-security-group.sh       # セキュリティグループ管理スクリプト
├── reports/                       # スキャンレポート出力先（自動生成）
└── scripts/                       # カスタムZAPスクリプト（オプション）
```

## 前提条件

### 必須

- Docker Desktop がインストールされていること
- AWS CLI がインストール・設定されていること（セキュリティグループ管理用）
- Staging環境のECSタスクが起動していること

### オプション

- `jq` コマンド（JSONパース用、レポートサマリー表示に使用）

## 使用方法

### 1. セキュリティグループの設定

Staging環境のALBは、セキュリティグループで特定のIPアドレスからのアクセスのみを許可しています。
DASTテストを実行する前に、自分のIPアドレスをセキュリティグループに追加する必要があります。

```bash
# 自分のIPアドレスを自動検出して追加
./manage-security-group.sh add

# 現在のルールを確認
./manage-security-group.sh list

# テスト完了後、IPアドレスを削除（セキュリティのため推奨）
./manage-security-group.sh remove
```

**オプション:**

```bash
# 手動でIPアドレスを指定して追加
./manage-security-group.sh add -i 203.0.113.10
```

### 2. ZAPスキャンの実行

#### 基本的な使い方

```bash
# デフォルト設定でベースラインスキャンを実行
./run-zap-scan.sh
```

これにより、以下が実行されます。

1. 対象URLの疎通確認
2. Dockerイメージの確認・プル
3. OWASP ZAPベースラインスキャン
4. レポート生成（HTML、JSON、Markdown、XML）

#### カスタムURL指定

```bash
# 特定のURLをテスト
./run-zap-scan.sh -t http://bookmark-manager-staging-alb-2010620542.ap-northeast-1.elb.amazonaws.com/api
```

#### フルスキャン（能動的攻撃を含む）

⚠️ **警告:** フルスキャンは能動的攻撃を含むため、本番環境では実行しないでください。

```bash
./run-zap-scan.sh -m full
```

### 3. レポートの確認

スキャン完了後、`reports/` ディレクトリに以下の形式でレポートが生成されます。

- `zap-baseline-report-YYYYMMDD-HHMMSS.html` - HTMLレポート（推奨）
- `zap-baseline-report-YYYYMMDD-HHMMSS.json` - JSONレポート（プログラム処理用）
- `zap-baseline-report-YYYYMMDD-HHMMSS.md` - Markdownレポート
- `zap-baseline-report-YYYYMMDD-HHMMSS.xml` - XMLレポート

#### HTMLレポートを開く

```bash
# macOS
open reports/zap-baseline-report-YYYYMMDD-HHMMSS.html

# Linux
xdg-open reports/zap-baseline-report-YYYYMMDD-HHMMSS.html
```

## スキャンモード

### ベースラインスキャン（推奨）

- **概要:** 受動的スキャンのみを実行
- **特徴:** アプリケーションに攻撃せず、トラフィックを観察してリスクを検出
- **所要時間:** 数分〜10分程度
- **推奨用途:** 定期的なセキュリティチェック、CI/CDパイプライン

```bash
./run-zap-scan.sh -m baseline
```

### フルスキャン

- **概要:** 能動的スキャンを含む包括的なテスト
- **特徴:** XSS、SQLインジェクション等の実際の攻撃を試行
- **所要時間:** 30分〜数時間
- **推奨用途:** 本格的なセキュリティ監査、リリース前の最終確認
- **注意:** 本番環境では実行しないこと

```bash
./run-zap-scan.sh -m full
```

## スキャン設定のカスタマイズ

[zap-baseline-config.yaml](zap-baseline-config.yaml) を編集することで、スキャン動作をカスタマイズできます。

### 除外パスの追加

```yaml
excludePaths:
  - "*/api/health*"
  - "*/admin/*"  # 管理画面を除外
```

### スキャンルールの無効化

```yaml
disableRules:
  - 10021  # X-Content-Type-Options header missing
```

### アラート閾値の変更

```yaml
scanPolicy:
  failOnRisk: "Medium"  # Medium以上でビルド失敗
```

## トラブルシューティング

### 対象URLに接続できない

**エラー:** `✗ 対象URLに接続できません`

**原因と対処:**

1. **ECSタスクが停止している**
   - Staging環境は平日9:00-22:00 JSTのみ稼働
   - ECSコンソールでタスクを手動起動するか、稼働時間内に実行

2. **セキュリティグループで許可されていない**

   ```bash
   ./manage-security-group.sh add
   ```

3. **ネットワーク接続の問題**

   ```bash
   curl -v http://bookmark-manager-staging-alb-2010620542.ap-northeast-1.elb.amazonaws.com/samples
   ```

### Dockerイメージのプルに失敗

```bash
# Dockerが起動しているか確認
docker ps

# 手動でイメージをプル
docker pull ghcr.io/zaproxy/zaproxy:stable
```

### AWS CLIの認証エラー

```bash
# 認証情報を設定
aws configure

# 認証情報を確認
aws sts get-caller-identity
```

### レポートが生成されない

```bash
# reports/ディレクトリの権限を確認
ls -la reports/

# 手動でディレクトリを作成
mkdir -p reports
chmod 755 reports
```

## Docker Composeを使用した実行（オプション）

`docker-compose.yml` を使用して実行も可能です。

```bash
# デフォルト設定で実行
docker compose up

# カスタムURL指定
TARGET_URL=http://example.com/ docker compose up

# バックグラウンド実行
docker compose up -d

# ログ確認
docker compose logs -f

# 停止・クリーンアップ
docker compose down
```

## ベストプラクティス

1. **定期的なスキャン実行**
   - 週次または月次でベースラインスキャンを実行
   - 重要な機能追加時にはフルスキャンを実行

2. **セキュリティグループの管理**
   - テスト完了後は必ずIPアドレスを削除
   - 最小権限の原則に従う

3. **レポートの保管**
   - スキャン履歴を保存し、脆弱性の推移を追跡
   - 高リスクの脆弱性は即座に対応

4. **誤検知の管理**
   - 誤検知（False Positive）は設定ファイルで除外
   - 除外理由をコメントで記録

5. **CI/CDへの統合（将来）**
   - デプロイパイプラインにDASTを組み込む
   - 高リスクの脆弱性検出時はデプロイをブロック

## 参考リンク

- [OWASP ZAP 公式ドキュメント](https://www.zaproxy.org/docs/)
- [ZAP Baseline Scan](https://www.zaproxy.org/docs/docker/baseline-scan/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [セキュリティ設計ドキュメント](../../docs/spec/docs/05-内部設計/共通仕様/セキュリティ設計.md)

## ライセンス

OWASP ZAPは Apache 2.0 ライセンスで提供されています。
