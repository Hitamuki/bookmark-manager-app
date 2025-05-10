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

## 技術スタック

### AI駆動開発

#### AIモデル

| モデル名          | 提供元          | 特徴                                                                       | 料金（入力/出力）               | コンテキスト長 | 主な用途・強み                                               |
| ----------------- | --------------- | -------------------------------------------------------------------------- | ------------------------------- | -------------- | ------------------------------------------------------------ |
| Claude 3.7 Sonnet | Anthropic       | ハイブリッド推論モード（即時応答と深い推論の切替）搭載。精度と速度が向上。 | $3 / $15（100万トークン）       | 約200K         | 高度な推論、コーディング、計画立案、分析など幅広く対応。     |
| Claude 4.0        | Anthropic       |                                                                            |                                 |                |                                                              |
| Gemini 2.5 Pro    | Google DeepMind | 高精度な推論＋マルチモーダル対応。思考予算（Thinking Budget）機能あり。    | $20/月（Google One AI Premium） | 最大1M         | 長文要約、画像処理、研究、教育など多用途に活用可能。         |
| OpenAI o3         | OpenAI          | 画像を使った高度推論可能。Deliberative Alignmentで安全性が高い。           |                                 |                | 高度な推論、安全性が求められるビジネス・研究分野。           |
| OpenAI o4-mini    | OpenAI          | 高速かつコスト効率に優れた軽量モデル。画像推論にも対応。                   |                                 |                | 高速応答アプリ、チャットボット、コスト重視の開発におすすめ。 |

#### AIコーディング支援・エージェント

| ツール             | 特徴                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| Cline、Roo Code    | VS Code上で動作する対話型のAIエージェント                                        |
| GitHub Copilot     | コード補完。Visual Studio Code v1.99でGithub Copilot Agent Mode登場              |
| Gemini Code Assist | GoogleのGeminiを活用した開発支援AI                                               |
| Cursor             | VSCodeを拡張したAIエディタ。GitHub Copilotとの統合やチャット機能を強化           |
| Windsurf           | AI補完を強化したエディタ。長いコンテキストを保持し、コードレビューも支援         |
| Codeium            | 無料で使えるAIコード補完ツール。Copilotの代替として人気                          |
| Devin 2.0          | 完全自律型のソフトウェアエンジニアAIツール                                       |
| Amazon Q           | AWS環境向けのAIコードアシスタント                                                |
| (✕)CodePlan        | リポジトリレベルのコーディング作業を解決するフレームワーク。2023年以降話題がない |

#### AIチャットアシスタント

| ツール                     | 特徴                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| ChatGPT                    | OpenAIのAI                                                             |
| Claude                     | AnthropicのAI                                                          |
| Gemini                     | GoogleのAI                                                             |
| &nbsp;Gemini Deep Research | 調査・分析に特化したAIエージェント                                     |
| Microsoft Copilot          | Microsoft 365やEdge/Bing統合のAI                                       |
| Perplexity                 | AIチャットボット型の検索エンジン                                       |
| (✕)DeepSeek                | DeepSeekは中国企業のAIのため、安全性や情報漏洩リスクに対する懸念がある |

#### AIデザインツール

| ツール       | 特徴                                           |
| ------------ | ---------------------------------------------- |
| Canva        | AIを活用したグラフィックデザインツール。       |
| v0 by Vercel | Tailwind CSSに対応したUIコンポーネント生成AI。 |
| Figma AI     | FigmaのAI支援機能。デザインの自動生成や調整。  |

#### AIソフトウェア開発支援

| ツール           | 特徴                           |
| ---------------- | ------------------------------ |
| Google AI Studio | Gemini APIを利用した開発環境。 |
| Bolt.new         | WebアプリのUIをAIが自動生成。  |

#### MCPサーバー

| 項目       | 特徴 |
| ---------- | ---- |
| GitHub     |      |
| Figma      |      |
| Playwright |      |
| PostgreSQL |      |
| Perplexity |      |
| Notion     |      |

#### AIその他

- Agent2Agent Protocol (A2A)

### 設計

- Figma
- Hugo
- MkDocs
- GitHub Pages
- draw.io
- mermaid
- PlantUML

### アプリ全般

- 開発言語
  - Universal JS
  - Full-Stack TypeScript
  - TypeScript
- バージョン管理ツール
  - mise
  - Volta
- バンドルツール
  - Vite
  - Turbopack
- ビルドツール
  - Vite
  - esbuild
- テストツール
  - Vitest
    - ユニットテスト
  - Playwright
    - E2Eテスト
  - Storybook
    - UIコンポーネントのカタログ
  - React Testing Library
    - Reactコンポーネントのテスト
- コード品質
  - Biome
    - フォーマッタ、静的解析
  - stylelint
    - CSSの静的解析
  - GitHub Code Scanning
    - セキュリティ脆弱性スキャン
  - SonarQube
    - コードの静的解析、品質管理
- バリデーション
  - Zod
- その他ライブラリ
  - es-toolkit
    - ESモジュール用のツール群
  - chokidar
    - ファイル監視
  - faker-js
    - ダミーデータ生成

### Webアプリ

#### フロントエンド

- 開発言語
  - TypeScript
  - React
- フレームワーク
  - Next.js
    - ランディングページはSSGかSSR
    - アプリはSPA
- CSS
  - Tailwind CSS
    - v0で使用
  - Material UI
  - Sass
- ライブラリ
  - 状態管理
    - Zustand
    - Jotai
    - Recoil
    - Redux
  - 認証
    - NextAuth.js

#### バックエンド

- 開発言語
  - TypeScript
- 実行環境
  - Node.js
- フレームワーク
  - NestJS
- Web APIスキーマ
  - REST API
    - OpenAPI
- ライブラリ
  - Prisma
    - O/Rマッパ
  - log4js
    - ログ
  - Passport
    - 認証
  - msw
    - APIモック
  - Orval、openapi-typescript
    - OpenAPIスキーマから型を自動生成
- 認証/セキュリティ
  - JWT
  - OAuth
  - SSLサーバー証明書
  - Supabase Auth

### モバイルアプリ

- 開発対象
  - iOSアプリ
  - Androidアプリ
- 開発言語
  - TypeScript
- フレームワーク
  - React Native
- プラットフォーム
  - Expo
- シミュレーター、エミュレーター
  - Xcode
  - Android Studio
- ツール
  - Expo CLI
  - Flipper、React Native Debugger
    - デバッグツール
  - EAS CLI
    - Expoのビルドとデプロイの管理
  - React Native Tools
  - Expo Go
    - 開発中のアプリを実際のデバイスでテストできる
- ライブラリ
  - 認証
    - SecureStore
    - AsyncStorage

### DB

- PostgreSQL
- MongoDB
  - 操作ログなど

### インフラ

| 項目                | 小規模向け                                                                   | 大規模向け                                                         |
| ------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Next.js (Web)       | Vercel, Netlify, Railway, Vercel Edge Functions                              | AWS EC2, ECS, Kubernetes, Cloudflare Workers                       |
| NestJS (API)        | Railway, Render, VPS (Linode, DigitalOcean), Supabase Edge Functions, Fly.io | AWS ECS, EKS, Kubernetes, Cloudflare Workers, Cloudflare Functions |
| DB (PostgreSQL)     | Supabase, PlanetScale, Railway, Fly.io                                       | AWS RDS, Aurora                                                    |
| DB (MongoDB)        | MongoDB Atlas                                                                | Amazon DocumentDB, Docker + ECS                                    |
| React Native (Expo) | Expo Go, EAS Build, Play Store / App Store                                   | EAS Build, Firebase App Distribution                               |
| 認証プロバイダー    | Firebase Auth, Supabase Auth                                                 | Auth0, AWS Cognito                                                 |
| CDN / 画像配信      | Cloudflare, ImageKit                                                         | AWS CloudFront, Fastly                                             |
| ロードバランサ      | なし (単一サーバー)                                                          | AWS ALB / NLB, nginx, Cloudflare Load Balancer                     |
| コンテナ化          | Docker (オプション)                                                          | Docker + Kubernetes                                                |
| ログ監視            | Sentry, Logtail                                                              | AWS CloudWatch, Datadog, New Relic                                 |

### ツール

## ツール一覧

| 分類                  | ツール                 | 用途・説明                                                           |
| --------------------- | ---------------------- | -------------------------------------------------------------------- |
| バージョン管理・CI/CD | GitHub                 | ソースコードのホスティング、バージョン管理                           |
|                       | GitHub CLI             | GitHubの操作をコマンドラインから行う                                 |
|                       | GitHub Actions         | CI/CDパイプラインの自動化                                            |
| データベース管理      | DBeaver                | GUIベースのデータベース管理ツール、複数のDBエンジンに対応            |
| コード品質管理        | SonarQube              | コードの静的解析、品質管理、セキュリティチェック                     |
|                       | GitHub Code Scanning   | リポジトリ内の脆弱性やコード品質のスキャン                           |
|                       | reviewdog              | CI上でのコードレビュー自動化、Lint結果のコメント付与                 |
| API開発・テスト       | Postman                | APIの設計、テスト、ドキュメント作成                                  |
|                       | Swagger                | OpenAPIベースのAPIドキュメント生成、APIの可視化とテスト              |
| パフォーマンステスト  | Locust                 | 負荷テストツール、Python製、スクリプトによる柔軟なシナリオ設定が可能 |
|                       | K6                     | JavaScriptベースのパフォーマンステストツール、CI/CD統合向け          |
|                       | Lighthouse             | Webページのパフォーマンス・アクセシビリティ監査ツール、Google提供    |
| シークレット管理      | GitHub Secrets         | シークレット情報の管理                                               |
| 監視・ログ管理        | Datadog                | インフラ・アプリのモニタリング、ログ分析、アラート通知               |
| DBマイグレーション    | Flyway                 | データベースのバージョン管理、スキーマ変更の管理                     |
| 脆弱性診断            | OWASP Dependency-Check | 依存ライブラリの脆弱性診断、OWASP提供                                |

### その他

- マルチテナント
- ランタイム
  - Bun
  - Node.js
- リポジトリ管理
  - モノレポ
    - Nx
    - Turborepo
    - pnpm
  - ポリレポ
- 自動化ツール
  - husky
  - lint-staged
- Gitブランチ戦略
  - Git flow
- エディタ
  - Vim

## テスト

- ビジュアルリグレッションテスト
  - Storybook
  - Chromatic
- スナップショットテスト
  - Jest
- アクセシビリティ
  - <https://sqripts.com/2023/10/19/73850/>
  - eslint-plugin-jsx-a11y
  - axe-core
  - axe Accessibility Linter
  - Accessibility Insights for Web
- 性能テスト
  - K6、Locust
  - テスト種別
    - 負荷テスト
      - ユーザー量、データ量、リソース使用量、スケーラビリティ
    - ストレステスト
    - スパイクテスト
    - ロングランテスト
  - パフォーマンスチューニング
    - DBのキャッシュ・インデックス
  - RAILモデル
  - Core Web Vitals
    - Lighthouse
    - Web Vitals

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
