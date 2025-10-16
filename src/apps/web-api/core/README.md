# Web API

## 概要

## 技術構成

### フレームワーク

| 名称   | バージョン                                        | 概要 | ドキュメント        | 備考 |
| ------ | ------------------------------------------------- | ---- | ------------------- | ---- |
| NestJS | [11.0.7](https://github.com/nestjs/nest/releases) |      | https://nestjs.com/ |      |

### ライブラリ

| 名称        | 概要       | ドキュメント               | 備考 |
| ----------- | ---------- | -------------------------- | ---- |
| nestjs-i18n | 多言語対応 | https://nestjs-i18n.com/   |      |
| Prisma      | O/Rマッパ  | https://www.prisma.io/docs |      |
|             |            |                            |      |

## コマンド

``` bash
# ビルド
pnpm nx run api-core:build
# ローカル環境実行
pnpm nx run api-core:serve
# APIクライアント生成
pnpm generate:api-client
```

## ToDo

- ビルド前に「pnpm nx reset」を実行しないと挙動が不正確になる
- openapi.json更新時の作業を自動化したい
  - pnpm generate:api-client実行
  - Apidogに取り込み
  - 対象のコントローラーのユニットテスト実施
  - 結合テスト実施
- 脱Webpack
