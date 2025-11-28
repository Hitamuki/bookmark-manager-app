# DAST - Production Environment

このディレクトリには、本番環境に対するOWASP ZAPを使用したDASTテストの設定とスクリプトが含まれています。

## 環境情報

- **対象URL**: `https://tidilyspace.com`
- **環境**: Production（本番環境）
- **アクセス制限**: なし（一般公開）
- **稼働時間**: 24時間365日

## ⚠️ 重要な注意事項

本番環境に対してセキュリティスキャンを実行する際は、以下を厳守してください。

1. **ベースラインスキャンのみ使用**
   - フルスキャン（能動的攻撃）は本番環境で使用禁止
   - スクリプトは自動的にフルスキャンをブロックする

2. **実行タイミング**
   - 営業時間外または低トラフィック時に実行
   - 定期メンテナンス時間帯を推奨

3. **事前通知**
   - 必ず関係者（運用チーム、開発チーム）へ事前通知
   - インシデント対応チームへの連絡

4. **監視体制**
   - スキャン中はモニタリングツール（Datadog、Sentry）を注視
   - 異常が発生した場合は即座に中止

## 使用方法

### 1. ZAPスキャンの実行

```bash
# ベースラインスキャン（本番環境では必ずこれを使用）
./run-zap-scan.sh

# カスタムURL指定（特定のエンドポイントのみテスト）
./run-zap-scan.sh -t https://tidilyspace.com/api
```

**注意**: スクリプトは確認プロンプトを表示します。必ず内容を確認してから実行してください。

### 2. Docker Composeでの実行

```bash
# デフォルト設定で実行
docker compose up

# カスタムURL指定
TARGET_URL=https://tidilyspace.com/api docker compose up
```

## レポート

スキャン結果は `reports/` ディレクトリに以下の形式で生成されます。

- `zap-baseline-report-YYYYMMDD-HHMMSS.html` - HTMLレポート
- `zap-baseline-report-YYYYMMDD-HHMMSS.json` - JSONレポート
- `zap-baseline-report-YYYYMMDD-HHMMSS.md` - Markdownレポート
- `zap-baseline-report-YYYYMMDD-HHMMSS.xml` - XMLレポート

### レポートの取り扱い

- 高リスクの脆弱性が検出された場合は直ちに対応
- レポートは機密情報として扱い、適切に保管
- セキュリティチームと共有して対応を協議

## 設定ファイル

- [zap-baseline-config.yaml](zap-baseline-config.yaml) - ZAPスキャン設定（本番環境用に最適化）
- [docker-compose.yml](docker-compose.yml) - Docker Compose設定
- [run-zap-scan.sh](run-zap-scan.sh) - スキャン実行スクリプト（安全性チェック付き）

## スキャン設定の特徴

本番環境用の設定は、Staging環境と比較して以下の点が異なります。

- **スキャン強度**: Low（負荷を最小限に）
- **スキャン時間**: 短縮（最大15分）
- **クローリング深度**: 浅め（最大3階層）
- **メモリ使用量**: 1GB（Stagingは2GB）

## トラブルシューティング

### スキャンが本番環境に影響を与えた場合

1. 即座にスキャンを中止（Ctrl+C）
2. インシデント対応チームに連絡
3. Datadog/Sentryで影響範囲を確認
4. 必要に応じてロールバックを検討

### 接続できない場合

```bash
# 疎通確認
curl -v https://tidilyspace.com

# DNS確認
dig tidilyspace.com

# SSL証明書確認
openssl s_client -connect tidilyspace.com:443 -servername tidilyspace.com
```

## 推奨スケジュール

- **頻度**: 月1回
- **タイミング**: 毎月第1日曜日 深夜2:00-4:00 JST
- **所要時間**: 約15分
- **担当**: セキュリティチーム

## エスカレーション

高リスクの脆弱性が検出された場合。

1. セキュリティチームリーダーに報告
2. 開発チームと対応策を協議
3. 緊急パッチの適用を検討
4. 影響範囲の調査と顧客への通知検討
