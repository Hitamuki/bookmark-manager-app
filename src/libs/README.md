# ライブラリ群（共通ロジック・再利用モジュール）

## 概要

- モノレポ構成における共通ライブラリ

## ディレクトリ構成

```txt
.
├── api-client                     # APIクライアント自動生成（Orval）
│   ├── endpoints                  # APIエンドポイント
│   └── model                      # 型定義
├── application                    # アプリケーション層（ユースケース／CQRS）
│   └── <domain>
│       ├── commands               # 書き込み操作（Command Handler）
│       ├── dto                    # DTO（Data Transfer Object）
│       └── queries                # 読み取り操作（Query Handler）
├── domain                         # ドメイン層（ビジネスロジックの中核）
│   └── <domain>
│       ├── entities               # ドメインエンティティ
│       ├── repositories           # リポジトリインターフェース
│       ├── services               # ドメインサービス
│       └── value-objects          # 値オブジェクト
├── infrastructure                 # インフラ層
│   ├── external                   # 外部API・外部サービス連携
│   ├── logging                    # ログ出力設定
│   └── prisma                     # 永続化層（ORM関連）
│       ├── prisma.service.ts      # Prismaサービス（DB接続）
│       └── repositories           # DBリポジトリ実装
├── prisma                         # Prisma設定・マイグレーション
│   ├── migrations                 # DBマイグレーションファイル
│   ├── schema.prisma              # Prismaスキーマ定義
│   └── seed.ts                    # 初期データ投入スクリプト
├── shared                         # 全レイヤ共通の型・ユーティリティ
│   ├── types                      # 型定義
│   └── utils                      # 汎用関数
└── ui                             # 再利用可能なUIコンポーネント
```

## コマンド

### Prisma

``` bash
# Prismaクライアントコードを生成（スキーマ変更やnode_modulesの削除時実行）
npx prisma generate
# Prismaマイグレーションを実行（スキーマ変更やdockerのvolume削除時実行）
npx prisma migrate dev
# Prisma Studio
npx prisma studio
```
