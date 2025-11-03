# Web API

## 概要

- メインのAPIサーバー

## アーキテクチャ

- DDD（ドメイン駆動設計）
  - ドメイン層・アプリケーション層・インフラ層・プレゼンテーション層を分離し、責務を明確化
- CQRS（Command Query Responsibility Segregation）
  - CommandとQueryを分離し、状態変更と取得の責務を独立させる
- DI / Decorator
  - NestJSの依存性注入とデコレータで柔軟なモジュール設計を実現

## ディレクトリ構成

```txt
.
├── src
│   ├── app.module.ts           # ルートモジュール（全モジュールのエントリポイント）
│   ├── assets                  # 静的アセット
│   ├── bootstrap               # アプリ初期化ロジック（main.tsで呼び出し）
│   ├── main.ts                 # エントリポイント（NestFactory起動）
│   └── presentation            # プレゼンテーション層（API公開インターフェース）
│       ├── filters             # 例外フィルター（ExceptionFilterなど）
│       └── middleware          # ミドルウェア（ログ、認証など）
└── test
    ├── api                     # APIテスト（REST Client）
    ├── integration             # 統合テスト（supertest）
    └── performance             # 負荷テスト（K6）
```

## 技術構成

![NestJS](https://img.shields.io/badge/NestJS-E0234E.svg?logo=nestjs)

| カテゴリ       | 使用技術                          | 備考             |
| -------------- | --------------------------------- | ---------------- |
| フレームワーク | [NestJS](https://docs.nestjs.com) | バージョン：11系 |

### ライブラリ

![Prisma](https://img.shields.io/badge/Prisma-2D3748.svg?logo=Prisma)
![React Query](https://img.shields.io/badge/React%20Query-white.svg?logo=reactquery)
![Axios](https://img.shields.io/badge/Axios-5A29E4.svg?logo=Axios)

| 名称                                                                              | 概要                       | 備考                                |
| --------------------------------------------------------------------------------- | -------------------------- | ----------------------------------- |
| [Prisma](https://www.prisma.io/docs)                                              | O/Rマッパ                  | スキーマ管理 / マイグレーション     |
| [Orval](https://orval.dev/overview)                                               | API Client・モック自動生成 |                                     |
| [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) | サーバー状態管理           | Orval設定ファイルのclientで指定     |
| [axios](https://axios-http.com/ja/docs/intro)                                     | HTTPクライアント           | Orval設定ファイルのhttpClientで指定 |
| [Winston](https://github.com/winstonjs/winston?tab=readme-ov-file)                | ロギング                   |                                     |
| [Nest CLI](https://docs.nestjs.com/cli/overview)                                  | NestJSのCLIツール          |                                     |
| [supertest](https://github.com/forwardemail/supertest)                            | 統合テスト                 |                                     |
| [nestjs-i18n](https://nestjs-i18n.com/ )                                          | 国際化（i18n）             | TBD                                 |

### ツール

![k6](https://img.shields.io/badge/k6-white.svg?logo=k6)

| 名称                                                                              | 概要                                                                 | 備考           |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------- |
| [Apidog](https://apidog.com/jp/)                                                  | API仕様書生成 / モックAPI / APIテスト（単体・シナリオ） / 負荷テスト |                |
| [REST Client](https://github.com/Huachao/vscode-restclient/blob/master/README.md) | APIテスト                                                            | VSCode拡張機能 |
| [K6](https://grafana.com/docs/k6/latest/)                                         | 負荷テスト                                                           |                |

## コマンド

``` bash
# ビルド
pnpm nx run api-core:build
# ローカル環境実行
pnpm nx run api-core:serve
# APIクライアント生成
pnpm generate:api-client
# テスト実行
pnpm exec nx run api-core:test
```

## ToDo

- ビルド前に「pnpm nx reset」を実行しないと挙動が不正確になる
- openapi.json更新時の作業を自動化したい
  - pnpm generate:api-client実行
  - Apidogに取り込み
  - 対象のコントローラーのユニットテスト実施
  - 結合テスト実施
- 脱Webpack
