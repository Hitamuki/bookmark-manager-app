# Claude

## MCPサーバー

外部ツールと連携することで自然言語で情報を取得＆操作ができる

| MCPサーバー                                | キー名                                       | 概要                                            | 備考                                                        |
| ------------------------------------------ | -------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| GitHub MCP Server                          | `github`                                     | GitHub API操作（リポジトリ、PR、Issue管理など） | Docker経由で実行、GitHub Personal Access Token必須          |
| Sentry MCP Server                          | `sentry`                                     | Sentryエラー監視・Issue管理                     | HTTPタイプ、認証は自動                                      |
| Datadog MCP Server                         | `mcp-server-datadog`                         | Datadogのメトリクス・ログ・トレース取得         | API Key・App Key必須、ap1リージョン<br>App KeyのScopeを調整 |
| AWS API MCP Server                         | `awslabs.aws-api-mcp-server`                 | AWS CLI操作・リソース管理                       | ap-northeast-1リージョン、AWS認証情報必須                   |
| AWS Diagram MCP Server                     | `awslabs.aws-diagram-mcp-server`             | AWSアーキテクチャ図の生成                       | Python diagrams パッケージ使用                              |
| AWS Billing and Cost Management MCP Server | `awslabs.billing-cost-management-mcp-server` | AWSコストと使用状況分析・最適化提案             | AWS Billing and Cost Management API使用                     |
| Terraform MCP Server                       | `awslabs.terraform-mcp-server`               | Terraform操作・プラン実行支援                   | -                                                           |

## 機能

### サブエージェント

Claude Codeに組み込まれている専門特化型AIエージェント。Task tool経由で起動する。

| サブエージェント  | 用途                                            | 主なツール                 |
| ----------------- | ----------------------------------------------- | -------------------------- |
| general-purpose   | 汎用タスク・複数ステップタスク・コード検索      | 全ツール                   |
| Explore           | コードベース探索・ファイル検索・構造理解        | Glob, Grep, Read           |
| Plan              | 実装計画策定・設計                              | 全ツール                   |
| claude-code-guide | Claude Code・Claude Agent SDKのドキュメント参照 | Glob, Grep, Read, WebFetch |
| statusline-setup  | Claude Codeステータスライン設定                 | Read, Edit                 |

### スラッシュコマンド

Claude Codeに組み込まれているコマンド。`/`で始まる。

| コマンド  | 説明                                               |
| --------- | -------------------------------------------------- |
| `/help`   | ヘルプ表示                                         |
| `/clear`  | 会話履歴をクリア                                   |
| `/exit`   | Claude Code終了                                    |
| `/commit` | Git commitヘルパー（ステージング・メッセージ作成） |
| `/pr`     | GitHub Pull Request作成ヘルパー                    |

### 主要ツール

Claude Codeが提供する操作ツール。

| ツール       | 用途                           |
| ------------ | ------------------------------ |
| Read         | ファイル読み込み               |
| Write        | ファイル書き込み               |
| Edit         | ファイル編集（部分置換）       |
| Bash         | シェルコマンド実行             |
| Glob         | ファイルパターン検索           |
| Grep         | コード内容検索（正規表現対応） |
| Task         | サブエージェント起動           |
| SlashCommand | カスタムスラッシュコマンド実行 |
| TodoWrite    | タスク管理（進捗追跡）         |
| WebFetch     | Web コンテンツ取得・分析       |
| WebSearch    | Web検索                        |

## カスタム機能

### カスタムスラッシュコマンド

Claude Codeで利用可能なスラッシュコマンド（カスタムコマンド）

#### 現在の設定

| コマンド   | 説明                   | ファイル                      |
| ---------- | ---------------------- | ----------------------------- |
| `/explain` | プロジェクト概要の説明 | `.claude/commands/explain.md` |

#### カスタムコマンドの追加方法

1. `.claude/commands/` ディレクトリに Markdown ファイルを作成
2. ファイル名がコマンド名になる（例: `review.md` → `/review`）
3. ファイル内にコマンドの処理内容を記述
4. Claude Codeを再起動して反映

### カスタムサブエージェント

プロジェクト固有のサブエージェント。`.claude/agents/`ディレクトリに配置します。

#### 現在の設定

| エージェント                 | 説明                                   | ファイル                                         |
| ---------------------------- | -------------------------------------- | ------------------------------------------------ |
| post-implementation-reviewer | コードレビュー（実装後の品質チェック） | `.claude/agents/post-implementation-reviewer.md` |

#### 使用方法

カスタムサブエージェントは、Claude Codeとの会話中に自動的に起動される。以下のような場合に使用される。

**post-implementation-reviewer の例**:
- ユーザーが「認証機能を実装しました。レビューをお願いします。」と依頼
- ユーザーがバグ修正後に「このコードをチェックしてください」と依頼
- ユーザーがリファクタリング後に「変更を確認してください」と依頼

明示的に起動したい場合は、Task toolを使用してエージェント名を指定する（Claude Codeが自動的に判断して実行）。

#### カスタムサブエージェントの追加方法

1. `.claude/agents/` ディレクトリに Markdown ファイルを作成
2. フロントマター（YAML）でメタデータを定義
   ```yaml
   ---
   name: agent-name
   description: エージェントの説明
   model: sonnet  # または opus, haiku
   ---
   ```
3. ファイル内にエージェントの動作指示を記述
4. Claude Codeを再起動して反映

## コマンド

```bash
# MCPサーバー追加
claude mcp add -s project ...
```

## 注意事項

- `.mcp.json`をバージョン管理しない
- `.mcp.json`更新時、`.mcp.sample.json`を更新
  - 機密情報を含めない

## ナレッジベース

- 定期的に`/init`を実行する
- こまめに`/clear`

## TBD

- DatadogのMCPサーバーを公式に置き換え
