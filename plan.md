# 構想

## 機能

### ver1.0.0

- ランディングページ
- ユーザー新規登録、ログイン、ログアウト
  - パスワード認証
  - ソーシャルログイン
  - MFA
    - SMS認証
- 規約
  - 個人情報保護方針（プライバシーポリシー）
  - 利用規約
- 基本機能
  - ブックマークの保存
  - ブックマークの編集、移動、削除
  - フォルダの階層構造で管理
  - ドラッグ＆ドロップ
- ブックマークごとにメモ
- 項目(Space)ごとにドロップダウンリスト等で切り替え
- リリースノート
- マルチデバイス対応

### ver1.1

- 検索
- 広告
- PWA
- 規約
  - クッキーポリシー
  - 広告ポリシー

### ver1.2

- サブスクリプション
  - 端末数
  - ブックマーク数
- 規約
  - 特定商取引法に基づく表示
  - キャンセル・返金ポリシー

### ver1.3以降

- モバイルアプリ対応
- ヘルプ、FAQ、お問い合わせ
  - Dify
- 多言語対応
- 設定
  - テーマ変更
  - 言語設定
- カレンダー連携

## 技術スタック

### AI駆動開発

#### AIコード補完・生成ツール

| ツール             | 特徴                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| Cline、Roo Code    | VS Code上で動作する対話型のAIエージェント                                          |
| Cursor             | VSCodeを拡張したAIエディタ。GitHub Copilotとの統合やチャット機能を強化。           |
| Windsurf           | AI補完を強化したエディタ。長いコンテキストを保持し、コードレビューも支援。         |
| GitHub Copilot     | OpenAIのGPTを利用したコード補完。                                                  |
| Codeium            | 無料で使えるAIコード補完ツール。Copilotの代替として人気。                          |
| Amazon Q           | AWS環境向けのAIコードアシスタント。                                                |
| Gemini Code Assist | GoogleのGeminiを活用した開発支援AI。                                               |
| (✕)CodePlan        | リポジトリレベルのコーディング作業を解決するフレームワーク。2023年以降話題がない。 |

#### AIチャットアシスタント

| ツール            | 特徴                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| ChatGPT           | OpenAIの対話型AI。開発補助やコード生成が可能。                         |
| Claude            | AnthropicのAI。コンテキスト保持が優秀。                                |
| Gemini            | GoogleのAI。コード理解能力も向上。                                     |
| Microsoft Copilot | Microsoft 365やEdge/Bing統合のAI。                                     |
| Perplexity        | 高性能なAI検索エンジン。開発のリサーチ向け。                           |
| (✕)DeepSeek       | DeepSeekは中国企業のAIのため、安全性や情報漏洩リスクに対する懸念がある |

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
| PostgreSQL |      |
| GitHub     |      |
| Perplexity |      |
| Notion     |      |
| Figma      |      |
| Playwright |      |

### 設計

- Figma
- Hugo
- MkDocs
- GitHub Pages
- draw.io
- mermaid
- PlantUML

### アプリ全般

- Universal JS
  - TypeScript
- バージョン管理ツール
  - Volta
  - pnpm
  - Corepack
- バンドルツール
  - Vite
  - Turbopack
- ビルドツール
  - Vite
  - esbuild
- テストツール
  - Vitest
  - Playwright
  - Storybook
  - React Testing Library
- コード品質
  - Biome
  - stylelint
  - GitHub Code Scanning
  - SonarQube
- バリデーション
  - Zod
- その他
  - es-toolkit
  - msw
  - faker-js
  - chokidar
  - Orval
  - openapi-typescript

### Webアプリ

#### フロントエンド

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

#### バックエンド

- TypeScript
  - Node.js
  - フレームワーク
    - Nest.js
- Web APIスキーマ
  - REST API
    - OpenAPI
- ライブラリ
  - Open APIスキーマから自動生成
    - Orval
  - ORM
    - Prisma
  - ログ
    - log4js
  - 認証
    - Passport
- 認証/セキュリティ
  - JWT
  - OAuth
  - SSL
  - Supabase Auth

### モバイルアプリ

#### モバイルアプリのフロントエンド

- React Native(Expo)

### DB

- PostgreSQL
- MongoDB
  - 操作ログなど

### インフラ

| 項目                   | 小規模向け                                                                   | 大規模向け                                     |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| Next.js (Web)          | Vercel, Netlify, Railway, Vercel Edge Functions                              | AWS EC2, ECS, Kubernetes, Cloudflare Workers   |
| NestJS (API)           | Railway, Render, VPS (Linode, DigitalOcean), Supabase Edge Functions, Fly.io | AWS ECS, EKS, Kubernetes, Cloudflare Workers   |
| DB (PostgreSQL, MySQL) | Supabase, PlanetScale, Railway, Fly.io                                       | AWS RDS, Aurora                                |
| React Native (Expo)    | Expo Go, EAS Build, Play Store / App Store                                   | EAS Build, Firebase App Distribution           |
| 認証 (Auth)            | Firebase Auth, Supabase Auth                                                 | Auth0, AWS Cognito                             |
| CDN / 画像配信         | Cloudflare, ImageKit                                                         | AWS CloudFront, Fastly                         |
| ロードバランサ         | なし (単一サーバー)                                                          | AWS ALB / NLB, nginx, Cloudflare Load Balancer |
| コンテナ化             | Docker (オプション)                                                          | Docker + Kubernetes                            |
| ログ監視               | Sentry, Logtail                                                              | AWS CloudWatch, Datadog, New Relic             |

### ツール

- GitHub
  - GitHub Actions
  - GitHub Code Scanning
- DBeaver
- SonarQube
- reviewdog
- Postman
- Locust
- K6
- Lighthouse
- Datadog
- Swagger
- Vim
- DBマイグレーション
  - Flyway

### その他

- ランタイム
  - Bun
  - Node.js
- リポジトリ管理
  - モノレポ
    - Turborepo
    - pnpm
  - ポリレポ
- 自動化ツール
  - husky
  - lint-staged
- Gitブランチ戦略
  - git-flow

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
    - .clinerules作成
      - <https://zenn.dev/berry_blog/articles/c72564d4d89926>
    - Cursor
    - Windsurf
- リポジトリ管理の設定
  - pnpm
  - Turborepo
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
      - ナレッジベース
      - 日記
      - 課題管理
      - 議事録
  - アプリ
    - 画面
    - API
    - DB
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
  - 単体テスト
    - Vitest
  - 結合テスト
    - Vitest
  - ビジュアルリグレッションテスト
    - Storybook
  - APIテスト
    - Postman
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
  - 将来的に追加されるかもしれないことや考慮することを明記する
  - エッジケースについて
