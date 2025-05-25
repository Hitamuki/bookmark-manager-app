# 構想

## 機能

### ver1.0.0

- 基本機能
  - ブックマークの保存
  - ブックマークの編集、移動、削除
  - フォルダの階層構造で管理
  - ドラッグ&ドロップ
- ブックマークにメモ
- 項目(Space)ごとにドロップダウンリスト等で切り替え
- マルチデバイス対応
- PWA
- リリースノート

### ver1.1

- ランディングページ
- ユーザー新規登録、ログイン、ログアウト
  - パスワード認証
  - ソーシャルログイン
  - MFA
    - SMS認証
- 規約
  - 個人情報保護方針（プライバシーポリシー）
  - 利用規約

### ver1.2

- 検索
- 広告
- 規約
  - Cookieポリシー
  - 広告ポリシー

### ver1.3

- モバイルアプリ対応

### ver1.4

- 多言語対応
- 設定
  - テーマ変更
  - 言語設定

### ver1.5

- ヘルプ、FAQ、お問い合わせ
  - Dify

### ver1.6

- インフラ移行
  - Kubernetes
  - AWS
  - IaC
    - Terraform
- サブスクリプション
  - 端末数
  - ブックマーク数
- 規約
  - 特定商取引法に基づく表示
  - キャンセル・返金ポリシー

## 手順

- 使用するツールの設定
  - Github
    - ブランチ戦略
    - Git ProjectsのBacklogでタスク管理
      - <https://zenn.dev/ncdc/articles/55cc05c1a65292>
  - AI駆動開発の準備
    - .clinerulesファイル作成（Cline、Roo Code用）
    - .mdcファイル作成（Cursor用）
      - <https://zenn.dev/berry_blog/articles/c72564d4d89926>
    - .windsurfrulesファイル作成（Windsurf用）
    - Cursor
    - Windsurf
- パッケージ管理の設定
  - pnpm
  - npm
  - yarn
- ディレクトリ構造の作成
  - README
  - ドキュメント
    - 設計：MkDocs
      - RFP
      - 要求仕様
      - 要件定義
      - 外部設計
      - 内部設計
    - ログ：Hugo
      - テスト仕様書
      - 日記
      - 課題管理
      - 議事録
    - ソースコード
      - バックエンド
        - API
        - DB
      - Webアプリ
        - 画面
      - モバイルアプリ
      - 共通
        - ヘルパー関数
        - ユーティリティ
        - 認証
        - 状態管理
        - APIクライアント
      - ツール
        - CI/CD
      - スクリプト
        - ビルド
        - テスト
        - データベースのマイグレーション
- HugoとMkDocsの構成作成
- 設計
  - Figma、Figma AIで画面設計、ワイヤーフレーム、プロトタイプ
  - SwaggerでAPI設計
- 開発
  - エディタやIDEの拡張機能、設定
  - ディレクトリ構造（DDD）
  - CI/CDの設定
    - GitHub Actions
  - v0 by Vercelで画面実装
- テスト
  - 静的解析
    - Biome
    - EditorConfig
    - Code Spell Checker
  - コード分析
    - GitHub Code Scanning
    - SonarQube
  - ユニットテスト
    - Vitest
  - 結合テスト
    - Vitest
  - ビジュアルリグレッションテスト
    - Storybook
  - APIテスト
    - Postman
    - REST Client
  - E2Eテスト
    - Playwright
  - 性能テスト
    - Lighthouse
    - Web Vitals
    - K6
    - Locust
- デプロイ
- カットオーバー
  - マーケティング
- 運用
  - モニタリング、アプリケーション性能管理(APM)、パフォーマンス管理、メトリクス監視
    - Datadog
  - ヘルプ、FAQ、お問い合わせ
    - Dify
  - reviewdog
  - GitHub Issues
  - GitHub Discussions
  - ログ
  - DBマイグレーション
    - Flyway

## メモ

### 作業前に

- 始める前に今までの仕事の経験や反省からどのような取り組みをしたいか想いを整理する
  - 属人化を防ぐ仕組みや資料を作りたい
  - 設計と実装の一貫性を持たせたい、そのためにトレーサビリティを考慮したい
  - 統一性のあるフォーマットにしたい
  - ミスを防ぐための細かい設定やルール決めを最初にすることで、可読性の維持やメンテナンス性を高めたい
  - 課題や懸案事項、ナレッジをまとめることで、認識を可視化する仕組みを作りたい
  - README、Wiki、ナレッジベースなどの使い分けを明確にし、こまめに更新する
  - パフォーマンスの目標値を事前に決めて、計測の手段を事前に知っておく
  - 運用でカバーする操作があればバグと勘違いしないように明記する
  - 将来的に追加される可能性や考慮することを明記する
  - エッジケースについて
