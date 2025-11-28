# DAST (Dynamic Application Security Testing)

このディレクトリには、OWASP ZAPを使用したDASTテストの設定とスクリプトが含まれています。

## 概要

OWASP ZAPは、Webアプリケーションの脆弱性を検出するための動的アプリケーションセキュリティテストツールです。
このプロジェクトでは、Staging環境とProduction環境に対してDASTテストを実行し、セキュリティリスクを早期に発見します。

## ディレクトリ構成

``` txt
security/dast/
├── README.md                      # このファイル
├── envs/                          # 環境別の設定
│   ├── staging/                   # Staging環境用
│   │   ├── README.md
│   │   ├── zap-baseline-config.yaml
│   │   ├── docker-compose.yml
│   │   ├── run-zap-scan.sh
│   │   ├── manage-security-group.sh
│   │   └── reports/
│   └── prod/                      # Production環境用
│       ├── README.md
│       ├── zap-baseline-config.yaml
│       ├── docker-compose.yml
│       ├── run-zap-scan.sh
│       └── reports/
└── shared/                        # 共通リソース（将来拡張用）
```

## 環境別の使い方

### Staging環境

開発・テスト用の環境です。ベースラインスキャンとフルスキャンの両方が実行可能です。

```bash
cd security/dast/envs/staging

# セキュリティグループにIPアドレスを追加
./manage-security-group.sh add

# ベースラインスキャン実行
./run-zap-scan.sh

# フルスキャン実行（能動的攻撃を含む）
./run-zap-scan.sh -m full

# テスト完了後、IPアドレスを削除
./manage-security-group.sh remove
```

詳細は [envs/staging/README.md](envs/staging/README.md) を参照してください。

### Production環境

⚠️ **本番環境では必ずベースラインスキャンのみを使用してください。**

```bash
cd security/dast/envs/prod

# ベースラインスキャン実行（本番環境はこれのみ）
./run-zap-scan.sh
```

詳細は [envs/prod/README.md](envs/prod/README.md) を参照してください。

## 前提条件

### 必須

- Docker Desktop がインストールされていること
- AWS CLI がインストール・設定されていること（Staging環境のセキュリティグループ管理用）

### オプション

- `jq` コマンド（JSONパース用、レポートサマリー表示に使用）

## スキャンモード

### ベースラインスキャン（推奨）

- **概要:** 受動的スキャンのみを実行
- **特徴:** アプリケーションに攻撃せず、トラフィックを観察してリスクを検出
- **所要時間:** 数分〜10分程度
- **推奨用途:** 定期的なセキュリティチェック、CI/CDパイプライン
- **使用可能環境:** Staging、Production

### フルスキャン

- **概要:** 能動的スキャンを含む包括的なテスト
- **特徴:** XSS、SQLインジェクション等の実際の攻撃を試行
- **所要時間:** 30分〜数時間
- **推奨用途:** 本格的なセキュリティ監査、リリース前の最終確認
- **使用可能環境:** Staging のみ
- **⚠️ 注意:** 本番環境では実行禁止

## レポート

スキャン完了後、各環境の `reports/` ディレクトリに以下の形式でレポートが生成されます。

- `zap-baseline-report-YYYYMMDD-HHMMSS.html` - HTMLレポート（推奨）
- `zap-baseline-report-YYYYMMDD-HHMMSS.json` - JSONレポート（プログラム処理用）
- `zap-baseline-report-YYYYMMDD-HHMMSS.md` - Markdownレポート
- `zap-baseline-report-YYYYMMDD-HHMMSS.xml` - XMLレポート

### HTMLレポートを開く

```bash
# macOS
open reports/zap-baseline-report-YYYYMMDD-HHMMSS.html

# Linux
xdg-open reports/zap-baseline-report-YYYYMMDD-HHMMSS.html
```

## 環境別の設定の違い

| 設定項目           | Staging | Production |
| ------------------ | ------- | ---------- |
| スキャン強度       | Medium  | Low        |
| 最大スキャン時間   | 30分    | 15分       |
| クローリング深度   | 5階層   | 3階層      |
| Ajaxスパイダー時間 | 5分     | 3分        |
| メモリ使用量       | 2GB     | 1GB        |
| フルスキャン       | 可能    | 禁止       |
| IP制限             | あり    | なし       |

## ベストプラクティス

### 全環境共通

1. **定期的なスキャン実行**
   - 重要な機能追加時には必ずスキャン実行
   - スキャン履歴を保存し、脆弱性の推移を追跡

2. **誤検知の管理**
   - 誤検知（False Positive）は設定ファイルで除外
   - 除外理由をコメントで記録

3. **レポートの保管**
   - レポートは機密情報として扱い、適切に保管
   - 高リスクの脆弱性は即座に対応

### Staging環境

1. **積極的なテスト**
   - 週次または月次でベースラインスキャンを実行
   - 重要な機能追加時にはフルスキャンを実行

2. **セキュリティグループの管理**
   - テスト完了後は必ずIPアドレスを削除
   - 最小権限の原則に従う

### Production環境

1. **慎重な実行**
   - 月1回程度、営業時間外または低トラフィック時に実行
   - 必ず事前に関係者へ通知

2. **監視体制**
   - スキャン中はモニタリングツールを注視
   - 異常が発生した場合は即座に中止

3. **エスカレーション**
   - 高リスクの脆弱性が検出された場合は即座に対応
   - セキュリティチームと開発チームで対応策を協議

## トラブルシューティング

### 対象URLに接続できない（Staging）

**エラー:** `✗ 対象URLに接続できません`

**原因と対処:**

1. **ECSタスクが停止している**
   - ECSコンソールでタスクを手動起動するか、稼働時間内に実行

2. **セキュリティグループで許可されていない**

   ```bash
   cd envs/staging
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

### AWS CLIの認証エラー（Staging）

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

## CI/CDへの統合（将来）

将来的には、以下のようにCI/CDパイプラインへの統合を予定しています。

1. **Staging環境**
   - デプロイ後に自動的にベースラインスキャンを実行
   - 高リスクの脆弱性検出時はSlack通知

2. **Production環境**
   - 定期的な自動スキャン（月1回、深夜時間帯）
   - 高リスクの脆弱性検出時はデプロイをブロック

## 参考リンク

- [OWASP ZAP 公式ドキュメント](https://www.zaproxy.org/docs/)
- [ZAP Baseline Scan](https://www.zaproxy.org/docs/docker/baseline-scan/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## ライセンス

OWASP ZAPは Apache 2.0 ライセンスで提供されています。

## TBD

- 本番環境でDASTを実行しない
  - 現在のStaging環境をDevelopmentに移行、prodと同じ構成をstagingに変更
