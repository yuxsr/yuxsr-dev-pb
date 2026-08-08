BIN := ./node_modules/.bin

# breaking change 判定の基準リビジョン。CI では BASE=origin/main のように上書きする。
BASE ?= .git#branch=main

.PHONY: help install generate compile lint format format-check breaking typecheck test go-vet verify clean

# verify の前提ターゲットは順序に依存する (generate がファイルを書き換えてから
# test が読む)。make -j でも壊れないように並列実行を禁止する。
.NOTPARALLEL:

help: ## 利用可能なターゲットを表示する
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Node 依存をインストールする
	npm ci

generate: ## proto からコードを生成し、Go/TS をビルドする
	npm run generate

lint: ## proto を buf lint で検証する
	$(BIN)/buf lint

format: ## proto の書式を正規化する
	$(BIN)/buf format -w

format-check: ## proto の書式崩れを検出する (書き換えない)
	$(BIN)/buf format --diff --exit-code

breaking: ## $(BASE) に対する破壊的変更を検出する
	$(BIN)/buf breaking --against '$(BASE)'

compile: ## src/index.ts から index.js / index.d.ts を生成する
	npm run compile

typecheck: ## 公開面の型チェックのみ実行する
	npm run typecheck

test: ## スモークテストを実行する
	npm test

go-vet: ## 生成された Go コードを検証する
	go vet ./...

verify: lint format-check generate go-vet test ## CI と同等の検証を一括実行する
	@# git diff は未追跡ファイルを検出しないため status を使う。
	@test -z "$$(git status --porcelain)" \
		|| { git status --porcelain; \
		     echo "生成物が最新ではありません。差分をコミットしてください。"; exit 1; }
	@echo "✅ すべての検証を通過しました。"

clean: ## ローカルにインストールした protoc プラグインを削除する
	rm -rf .tools
