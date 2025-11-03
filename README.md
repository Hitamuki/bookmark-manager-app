# ブックマーク管理アプリ

## 開発者用

### 概要

- AI駆動開発 × フルスタックTypeScript × IaC
- モノレポ構成でフロントエンド・バックエンド・インフラを統合管理

### ディレクトリ構成

``` txt
├─ docs     # ドキュメント
├─ src      # ソースコード
├─ infra    # インフラ
├─ scripts  # スクリプト
├─ poc      # PoC（Proof of Concept）
└─ sandbox  # サンドボックス
```

### ドキュメント、仕様書

[README](docs/README.md)

### ソースコード

[README](src/README.md)

### インフラ

[README](infra/README.md)

### スクリプト

[README](scripts/README.md)

### AI

| カテゴリ               | 使用技術                       | 備考                 |
| ---------------------- | ------------------------------ | -------------------- |
| エージェント(エディタ) | VSCode（Roo Code）             | 検討中：Cursor       |
| エージェント(CLI)      | Gemini CLI、Amazon Q Developer | 検討中：Claude Code  |
| コードアシスタント     | -                              |                      |
| コード補完             | -                              |                      |
| チャットボット         | ChatGPT、Claude                |                      |
| PRレビューボット       | TBD: Gemini Code Assist        |                      |
| 完全自律型エージェント | -                              | 検討中：Devin        |
| SWE-Agent              | -                              | 検討中：Google Jules |
| RAG                    | -                              | 検討中：Dify         |

#### MCPサーバー

- GitHub（TBD）

### ツール環境

![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-007ACC.svg?logo=visual-studio-code)
![Homebrew](https://img.shields.io/badge/Homebrew-white.svg?logo=Homebrew)
![EditorConfig](https://img.shields.io/badge/EditorConfig-gray.svg?logo=EditorConfig)
![Prettier](https://img.shields.io/badge/Prettier-white.svg?logo=Prettier)

| カテゴリ       | 使用技術                        | 備考                                  |
| -------------- | ------------------------------- | ------------------------------------- |
| エディタ       | Visual Studio Code              |                                       |
| パッケージ管理 | Homebrew / mise / pnpm          |                                       |
| コード品質     | EditorConfig / Biome / Prettier | 静的解析・フォーマッター              |
| 文章構成       | CSpell / textlint               | スペルチェック・Markdown/テキスト校正 |
| Git Hook       | husky / lint-staged             | コミット前の品質チェック              |

### DevOps

![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-white.svg?logo=githubactions)

| 項目                 | 内容                                             | 備考                 |
| -------------------- | ------------------------------------------------ | -------------------- |
| CI/CD                | GitHub Actions                                   |                      |
| ブランチ戦略         | GitHub Flow                                      |                      |
| コミット規約         | commitlint / Commitzen                           | Conventional Commits |
| コードレビュー自動化 | reviewdog                                        |                      |
| セキュリティテスト   | SAST: GitHub Code Scanning（CodeQL） / DAST: TBD |                      |

### プロジェクト管理

![GitHub](https://img.shields.io/badge/GitHub-181717.svg?logo=github)
![Notion](https://img.shields.io/badge/Notion-000000.svg?logo=Notion)
![Obsidian](https://img.shields.io/badge/Obsidian-7C3AED.svg?logo=Obsidian)

| 項目           | 内容                     | 備考                                                                            |
| -------------- | ------------------------ | ------------------------------------------------------------------------------- |
| チケット管理   | GitHub Projects / Issues | カンバン方式、Issue駆動開発                                                     |
| バージョン管理 | GitHub                   |                                                                                 |
| Wiki           | GitHub Wiki              | プロジェクトの方針、情報共有 / プロダクトのマニュアル、 FAQ、ヘルプ / Changelog |
| ナレッジベース | TBD: Notion、Obsidian    | 知識、日記、振り返り、疑問                                                      |

### その他

- [PoC](./poc/README.md)
- [サンドボックス](./sandbox/README.md)
