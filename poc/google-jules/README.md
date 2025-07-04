# Google Jules

## 目的

- SWEで一通りの技術スタックのたたき台が作れるか検証する

## 実施内容

## 所感

## 疑問

## リンク集

## 動作確認

``` bash
```

## コマンド

``` bash
```

## 記録

### 成果物

### プロンプト

``` txt
# 開発依頼：（ブックマーク+リーディングリスト）×ToDoのWebアプリ

## 前提

`poc/google-jules`をルートディレクトリとして、配下にファイルを作成してください。

## 概要

ブックマーク・リーディングリストをToDoのように扱えるアプリ。
タグ・カテゴリ・ステータス・リマインダー・スケジュールなどを用いて、整理・記録・閲覧・分類ができる。

## フェーズ

次の手順で開発する。

1. モノレポ初期構成
2. 必要なパッケージ導入
3. Prismaのモデル設計（ER図も出力して）
4. Web API
   - DDDの構成
5. PWA対応のWeb画面
   - Next.jsの画面ルーティング構成（App Router）
   - UIコンポーネント生成（Storybook付き）
6. モバイルアプリ

## 技術スタック

| 項目               | 使用技術                                     |
| ------------------ | -------------------------------------------- |
| Web API            | NestJS（DDD）                                |
| フロントエンド     | Next.js（App Router）                        |
| UI                 | Tailwind CSS, shadcn/ui, Material UI         |
| モバイル           | React Native（Expo）                         |
| 状態管理           | Jotai                                        |
| 認証               | Passport × JWT（Access + Refresh Token構成） |
| ORM                | Prisma（PostgreSQL用）                       |
| メインDB           | PostgreSQL（Docker）                         |
| ログDB             | MongoDB（Docker）                            |
| バリデーション     | Zod                                          |
| テスト             | Vitest, React Testing Library, Playwright    |
| モックAPI          | MSW                                          |
| コンポーネント管理 | Storybook                                    |
| モノレポ           | pnpm Workspace                               |
| 静的解析           | Biome                                        |
| ロギング           | Winston                                      |
| パッケージ管理     | pnpm                                         |

## 機能一覧

- ダッシュボード
- ブックマーク/リーディングリスト
  - 新規登録
  - 削除
  - 閲覧モード
  - 編集モード
- ツリー構造（フォルダ・アイテム）
  - フォルダにもメモを設定可能
- プロファイル切替（Private / Business / 学習など）
- カテゴリ・タグ・優先度・ステータス管理
- スケジュール（開始/終了 + リマインダー設定）
- カレンダー表示
- アーカイブ・ゴミ箱・お気に入り
- ドラッグ&ドロップで順序変更
- 検索・フィルター
- レスポンシブデザイン（スマホ、タブレット、PC）

## 画面項目

### ブックマーク/リーディングリスト

- 名前
- URL
- メモ
- フォルダー分け（カスタマイズ可能）
- カテゴリ（カスタマイズ可能）
- タグ（カスタマイズ可能）
- スケジュール（開始日時、終了日時）、リマインド
- ステータス（未定、未着手、進行中、保留、完了、アーカイブ、削除）
- 優先度（高、中、低）

## 特記事項

- Web画面、Web API、モバイルアプリのディレクトリでREADMEを作成し、環境構築や疎通方法、コマンドの使い方を日本語で記載して
- Zodを用いて、フロントとバックで型を共有したい
- BFFでtRPCを使用したい
- NestJSのAPIレスポンスはREST形式で統一し、DTOとエラーコードも設計
- PrismaはCLIで初期スキーマとマイグレーションを自動生成
- PlaywrightはE2Eでルーティング・モーダル動作・CRUD確認
- MSWはStorybook + Playwright両方で使う

## テスト方針

| レベル     | ツール                           | 概要                       |
| ---------- | -------------------------------- | -------------------------- |
| 単体テスト | Vitest + React Testing Library   | 各コンポーネント・ロジック |
| 結合テスト | MSW + Storybook Interaction Test | UI                         |
| E2Eテスト  | Playwright                       | 実ブラウザでのUI操作確認   |

## 参考UI/UX
```
