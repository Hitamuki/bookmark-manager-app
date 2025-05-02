# 設計書

- MkDocsで設計書を作成する

## MkDocs

### ドキュメント

- [MkDocs](https://www.mkdocs.org/)
- [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)
- [PyMdown Extensions](https://facelessuser.github.io/pymdown-extensions/)

### 環境構築

```bash
# mise.tomlに基づいてPythonをインストール
mise install
# 仮想環境作成
python -m venv .venv
# Fishでアクティベート
source .venv/bin/activate.fish
# パッケージをインストール
pip install -r requirements.txt
# アップグレード
pip install --upgrade pip
```

- インストール状況を記録する場合

```bash
pip freeze > requirements.txt
```

### ローカル実行

```bash
# ToDo: mkdocs.ymlがあるディレクトリに移動
# ビルド
mkdocs build
# サーバ起動
mkdocs serve
```
