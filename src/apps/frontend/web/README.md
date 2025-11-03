# Web画面

## 概要

- Next.js（App Router）を採用した SSR / SPAのハイブリッド構成

## アーキテクチャ

Feature-Driven Architecture

## ディレクトリ構成

```txt
.
├── public                      # 静的ファイル（画像、フォント、faviconなど）
├── src
│   ├── app                     # Next.js App Router構成（ページ、レイアウト、ルート設定）
│   ├── components              # 再利用可能なUIコンポーネント群
│   │   ├── layout              # ページ全体構造系のレイアウト（Header、Footerなど）
│   │   └── ui                  # 汎用UIパーツ
│   ├── constants               # 定数
│   ├── external                # 外部サービスやAPIとの通信処理（APIクライアント、外部SDKなど）
│   ├── features                # 機能単位のモジュール
│   ├── hooks                   # カスタムフック
│   ├── msw                     # Mock Service Worker設定
│   ├── providers               # コンテキストやグローバルな依存注入
│   ├── stores                  # 状態管理（Zustandなどのストア定義）
│   ├── styles                  # グローバルCSS、Tailwind設定、テーマ関連
│   ├── types                   # TypeScriptの型定義（DTO、共通型など）
│   └── utils                   # 汎用的なユーティリティ関数
└── test                        # テスト関連
    ├── e2e                     # E2Eテスト
    └── integration             # 統合テスト
```

## 使用技術

![Next.js](https://img.shields.io/badge/Next.js-000000.svg?logo=nextdotjs)
![React](https://img.shields.io/badge/React-white.svg?logo=react)

| カテゴリ       | 使用技術                                      | 備考                                                   |
| -------------- | --------------------------------------------- | ------------------------------------------------------ |
| フレームワーク | [Next.js](https://nextjs.org/docs)            | バージョン：15系 / AppRouter / レンダリング：SSR + SPA |
| ライブラリ     | [React](https://ja.react.dev/reference/react) | バージョン：19系                                       |

### ライブラリ

![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-white.svg?logo=tailwindcss)
![Storybook](https://img.shields.io/badge/Storybook-white.svg?logo=Storybook)
![Testing Library](https://img.shields.io/badge/Testing%20Library-white.svg?logo=testinglibrary)
![HeroUI](https://img.shields.io/badge/HeroUI-000000.svg?logo=HeroUI)
![Lucid](https://img.shields.io/badge/Lucid-282C33.svg?logo=Lucid)
![Stylelint](https://img.shields.io/badge/Stylelint-263238.svg?logo=Stylelint)

| 名称                                                                             | 概要                   | 備考                                                 |
| -------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------- |
| [Tailwind CSS](https://tailwindcss.com/docs)                                     | CSSフレームワーク      |                                                      |
| [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)             | 状態管理               |                                                      |
| [HeroUI](https://www.heroui.com/docs/)                                           | UIコンポーネント       |                                                      |
| [Lucide](https://lucide.dev/)                                                    | アイコン               |                                                      |
| [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | 単体・統合テスト       |                                                      |
| [Playwright](https://playwright.dev/docs/intro)                                  | E2Eテスト              |                                                      |
| [Storybook](https://storybook.js.org/docs)                                       | UIカタログ             | ビジュアルリグレッションテスト / Chromaticにデプロイ |
| [axe-core](https://www.deque.com/axe/core-documentation/)                        | アクセシビリティテスト |                                                      |
| [markuplint](https://markuplint.dev/)                                            | HTMLのコード品質       |                                                      |
| [Stylelint](https://stylelint.io/)                                               | CSSのコード品質        |                                                      |
| [i18next](https://www.i18next.com/)                                              | 国際化（i18n）         | TBD                                                  |
|                                                                                  |                        |                                                      |

## コマンド

``` bash
# ビルド
pnpm nx run web:build
# ローカル環境実行（モックを使用する場合は.envのNEXT_PUBLIC_API_MOCKINGをenabledに設定）
pnpm nx run web:dev
# 単体&統合テスト実行
pnpm nx run web:test
# E2Eテスト実行
pnpm nx run web:test:e2e
# Storybook
pnpm nx run web:storybook
```

## ToDo
