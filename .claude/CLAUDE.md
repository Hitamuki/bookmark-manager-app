# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

AI駆動開発によるブックマーク管理アプリケーション。フルスタックTypeScriptとモノレポ構成で、フロントエンド・バックエンド・インフラを統合管理。

### 基本スタック

- **モノレポ**: Nx (バージョン21系)
- **ランタイム**: Node.js 22.15.0
- **パッケージマネージャー**: pnpm (10.20.0以上)
- **言語**: TypeScript 5.9.3
- **フロントエンド**: Next.js 15系 (App Router) + React 19
- **バックエンド**: NestJS 11系
- **ORM**: Prisma 6系
- **バリデーション**: Zod 4系
- **テスティング**: Vitest 3系
- **コード品質**: Biome 2.3.0

## 必須コマンド

### 開発環境

```bash
# 依存パッケージのインストール（Prisma Clientも自動生成される）
pnpm install

# フロントエンド開発サーバー起動
pnpm nx run web:dev

# バックエンドAPI起動
pnpm nx run api-core:build
pnpm nx run api-core:serve
```

### ビルド・テスト

```bash
# 全プロジェクトビルド
pnpm build

# 全プロジェクトテスト
pnpm test

# 個別プロジェクトのテスト
pnpm nx run web:test                    # フロントエンド単体&統合
pnpm nx run web:test:e2e               # E2Eテスト (Playwright)
pnpm nx run api-core:test              # バックエンド単体&統合
pnpm nx run api-core:test:coverage     # カバレッジ付き
```

### コード品質

```bash
# リント実行
pnpm lint                              # Biome + textlint
pnpm lint:md                           # Markdown
pnpm check:spell                       # スペルチェック (CSpell)

# フォーマット
pnpm format                            # 全プロジェクト自動整形
pnpm lint:fix                          # 自動修正

# 個別プロジェクト
pnpm nx run web:lint:check            # Biome + markuplint + stylelint + textlint
pnpm nx run web:lint:fix              # 自動修正
pnpm nx run api-core:lint:check
pnpm nx run api-core:lint:fix
```

### データベース関連

```bash
# Prismaクライアント生成（install時に自動実行）
pnpm prisma generate --schema=src/libs/prisma/schema.prisma

# マイグレーション
pnpm prisma migrate dev --schema=src/libs/prisma/schema.prisma

# シード実行
pnpm prisma db seed
```

### API関連

```bash
# OpenAPI仕様からAPIクライアント生成（Orval）
pnpm generate:api-client
```

### Nx便利コマンド

```bash
# 依存関係グラフ表示
pnpm graph

# 影響範囲グラフ
pnpm affected:graph

# プロジェクト一覧
pnpm list:pj

# Nxキャッシュクリア（ビルドが不正確な場合）
pnpm nx reset
```

### Git

```bash
# Commitizen でコミット（Conventional Commits準拠）
pnpm commit

# huskyとlint-stagedがpre-commitで自動実行される
```

## アーキテクチャ

### モノレポ構成

```
src/
├── apps/                        # アプリケーション（エントリポイント）
│   ├── frontend/
│   │   ├── web/                # Next.js (SSR + SPA)
│   │   └── mobile/             # React Native (TBD)
│   ├── web-api/
│   │   └── core/               # NestJS REST API
│   └── batch/                  # 定期ジョブ・バッチ (TBD)
├── libs/                        # 共通ライブラリ
│   ├── api-client/             # Orval生成APIクライアント
│   ├── application/            # アプリケーション層（ユースケース）
│   ├── domain/                 # ドメイン層（エンティティ、値オブジェクト）
│   ├── infrastructure/         # インフラ層（リポジトリ実装）
│   ├── prisma/                 # Prismaスキーマ・マイグレーション
│   ├── shared/
│   │   ├── types/             # 共通型定義
│   │   └── utils/             # 汎用関数
│   └── ui/                     # React共有コンポーネント
└── tools/                       # 開発支援ツール
```

### バックエンド (NestJS)

**アーキテクチャパターン**:
- DDD (Domain-Driven Design) - レイヤー分離
- CQRS (Command Query Responsibility Segregation) - コマンドとクエリを分離
- 依存性注入 + Decorator パターン

**主要技術**:
- Prisma: O/Rマッパー（PostgreSQL）
- Winston: ロギング（MongoDB連携）
- Passport: 認証 (JWT/Local戦略)
- Class Validator / Class Transformer: バリデーション
- Swagger: OpenAPI仕様書自動生成

### フロントエンド (Next.js)

**アーキテクチャパターン**:
- Feature-Driven Architecture

**主要技術**:
- Tailwind CSS v4: CSSフレームワーク
- HeroUI: UIコンポーネントライブラリ
- Zustand: 状態管理
- TanStack Query: サーバー状態管理（Orvalで自動生成）
- Axios: HTTPクライアント（Orvalで自動生成）
- MSW: APIモック
- Storybook: UIカタログ（Chromatic連携）
- Lucide: アイコン

**ディレクトリ構成のポイント**:
- `app/`: Next.js App Router（ページ・レイアウト）
- `features/`: 機能単位のモジュール
- `components/`: 再利用可能なUIコンポーネント
- `stores/`: Zustandストア
- `external/`: 外部API通信

### データベース

- **RDB**: PostgreSQL 17 (Aurora) - Prismaでアクセス
- **NoSQL**: MongoDB 8.0 (Atlas) - ログ・履歴データ
- **ORM**: Prisma（スキーマ: `src/libs/prisma/schema.prisma`）

## 重要な開発ルール

### コミット規約

- Conventional Commits準拠
- `pnpm commit`でCommitizen使用推奨
- huskyでpre-commit/commit-msg検証
- commitlintで自動チェック

### コード品質ツール

- **Biome**: リント・フォーマット（JavaScript/TypeScript）
- **markuplint**: HTML検証（フロントエンドのみ）
- **stylelint**: CSS検証（フロントエンドのみ）
- **textlint**: Markdown/テキスト校正
- **CSpell**: スペルチェック
- **Prettier**: 一部ファイルのフォーマット（Biome未対応部分）

### テスト戦略

- **単体・統合**: Vitest + Testing Library
- **E2E**: Playwright
- **API**: supertest（統合）、REST Client（手動）、K6（負荷）
- **ビジュアルリグレッション**: Storybook + Chromatic
- **アクセシビリティ**: axe-core

### Prisma運用

- スキーマファイル: `src/libs/prisma/schema.prisma`
- シードファイル: `src/libs/prisma/seed.ts`
- `postinstall`で自動的にPrisma Clientを生成
- マイグレーションファイルは`src/libs/prisma/migrations/`に配置

### Orval運用（API Client生成）

- 設定ファイル: `src/tools/orval.config.ts`
- OpenAPI仕様書からTypeScript型とReact Query hooksを自動生成
- `pnpm generate:api-client`で実行
- 生成先: `src/libs/api-client/`

## トラブルシューティング

### ビルドが不正確な場合

```bash
# Nxキャッシュをクリア
pnpm nx reset

# node_modulesとdistを削除して再インストール
rm -rf node_modules dist
pnpm install
```

### VSCode関連

- TypeScriptサーバー再起動: コマンドパレット → "TypeScript: Restart TS Server"
- VSCode再起動: コマンドパレット → "Developer: Reload Window"

### OpenAPI更新時の手順

1. `pnpm generate:api-client`実行
2. Apidogに取り込み
3. 対象コントローラーのユニットテスト実施
4. 統合テスト実施

## 開発環境・ツール

- **エディタ**: VSCode
- **コンテナ**: Docker + Docker Compose（ローカル開発用）
- **DBクライアント**: DBeaver
- **API仕様管理**: Apidog（仕様書生成・モック・テスト）
- **バージョン管理**: mise（Node.js等のバージョン管理）

## インフラ（AWS + Terraform）

- **IaC**: Terraform
- **コンピューティング**: ECS on Fargate
- **ロードバランサー**: ALB
- **CDN**: CloudFront + WAF
- **DNS**: Route53
- **ストレージ**: S3（静的アセット）
- **DB**: Aurora PostgreSQL + MongoDB Atlas
- **モニタリング**: Datadog + Sentry
- **シークレット管理**: SSM Parameter Store

Terraformディレクトリ: `infra/`（modules: network, security, compute, database, storage, monitoring）

## 開発方針

### 応答言語

特に指定がない限り、日本語で応答すること。

### コード原則

- SOLID原則を守る
- 保守性・拡張性・移植性を重視
- DDD・CQRS・依存性注入を活用
- TypeScript型安全性を最大限活用
- セキュリティリスク（OWASP Top 10）に注意

### ドキュメント

- 仕様書: `docs/spec/`
- OpenAPI仕様書: NestJSのSwaggerデコレーターから自動生成
- 設計図: Mermaid/draw.io
- UIデザイン: Figma

## 参考リンク

- [TypeScript公式](https://www.typescriptlang.org/docs/)
- [TypeScript入門書](https://typescriptbook.jp/)
- [React公式](https://ja.react.dev/reference/react)
- [Next.js公式](https://nextjs.org/docs/)
- [NestJS公式](https://docs.nestjs.com/)
- [Prisma公式](https://www.prisma.io)
- [Nx公式](https://nx.dev/docs)
