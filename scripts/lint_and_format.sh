#!/bin/bash

# 一通りのLinterとFormatterを実行するスクリプト

# Lint
pnpm check:spell || exit 1
pnpm check:links || exit 1
pnpm lint:md:fix || exit 1
pnpm textlint . --fix || exit 1
pnpm markuplint . --fix || exit 1
pnpm stylelint . --fix || exit 1
pnpm biome check . --write || exit 1

# フォーマット
pnpm biome format . --write || exit 1
