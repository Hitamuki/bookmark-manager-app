# 開発全般

## モノレポ

![Nx](https://img.shields.io/badge/Nx-143055.svg?logo=Nx)

| 名称                      | 概要               | バージョン | 備考 |
| ------------------------- | ------------------ | ---------- | ---- |
| [Nx](https://nx.dev/docs) | モノレポ管理ツール | 21         |      |

### ディレクトリ構成

``` txt
├── apps                  # アプリケーション群（エントリポイント単位）
│   ├── batch             # バッチ処理（定期ジョブ・スクリプト）
│   ├── frontend          # フロントエンド群
│   │   ├── mobile        # React Native アプリ（モバイル）
│   │   └── web           # Next.js アプリ（Webフロント）
│   └── web-api           # サーバーサイド群（API層）
│       └── core          # NestJS アプリ（REST API）
├── libs                  # ライブラリ群（共通ロジック・再利用モジュール）
│   ├── api-client        # OpenAPI定義からOrvalで生成されたAPIクライアント
│   ├── application       # アプリケーション層（ユースケース、サービスクラス）
│   ├── domain            # ドメイン層（エンティティ、値オブジェクト、ドメインサービス）
│   ├── infrastructure    # インフラ層（DB・外部API接続・リポジトリ実装）
│   ├── prisma            # Prisma設定（スキーマ、マイグレーション、クライアント生成）
│   ├── shared            # プロジェクト全体で共通利用されるユーティリティ群
│   │   ├── types         # 型定義（TypeScript共通型）
│   │   └── utils         # 汎用関数（バリデーション、変換、フォーマッタなど）
│   └── ui                # UIコンポーネントライブラリ（React共有コンポーネント）
└── tools                 # 開発支援ツール（スクリプト・CLI・設定ジェネレータなど）
```

## フルスタックTypeScript

![Node.js](https://img.shields.io/badge/Node.js-white.svg?logo=nodedotjs)
![pnpm](https://img.shields.io/badge/pnpm-white.svg?logo=pnpm)
![TypeScript](https://img.shields.io/badge/TypeScript-white.svg?logo=typescript)
![Biome](https://img.shields.io/badge/Biome-white.svg?logo=Biome)
![Vitest](https://img.shields.io/badge/Vitest-white.svg?logo=Vitest)
![Zod](https://img.shields.io/badge/Zod-white.svg?logo=Zod)

| カテゴリ           | 使用技術                                                | 備考                                                          |
| ------------------ | ------------------------------------------------------- | ------------------------------------------------------------- |
| ランタイム         | Node.js 22.15.0                                         | [サポート期間](https://nodejs.org/ja/about/previous-releases) |
| パッケージ管理     | [pnpm](https://pnpm.io/ja/motivation)                   |                                                               |
| プログラミング言語 | [TypeScript](https://www.typescriptlang.org/ja/docs/)   |                                                               |
| コード品質         | [Biome](https://biomejs.dev/ja/guides/getting-started/) |                                                               |
| 単体・統合テスト   | [Vitest](https://vitest.dev/guide/)                     | バージョン：3系                                               |
| バリデーション     | [Zod](https://zod.dev/)                                 | バージョン：4系                                               |

### フロントエンド_Web

[README_Web画面](./apps/frontend/web/README.md)

### フロントエンド_モバイル

[README_モバイル](./apps/frontend/mobile/README.md)

### バックエンド_Web API

[README_Web API](./apps/web-api/core/README.md)

### 共通化

[README_共通パッケージ、ライブラリ](./libs/README.md)

## ミドルウェア

[README_ミドルウェア](./../infra/README.md/#ミドルウェア)

## Tips

### トラブルシューティング

- VSCode再起動
  - コマンドパレットから「Developer: Reload Window」
- VSCodeのTypeScriptサーバー再起動
  - コマンドパレットから「TypeScript: Restart TS Server」
- キャッシュのクリア
  - pnpm nx reset
  - rm -rf node_modules dist
