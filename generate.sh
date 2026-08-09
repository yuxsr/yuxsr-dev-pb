#!/usr/bin/env sh
set -eu

# Protocol Buffers 定義から Go / TypeScript のコードを生成する。
#
#   1. protoc プラグイン (ローカル) を用意する
#   2. 既存の生成物を削除する
#   3. buf generate でコードを生成する
#   4. Go モジュールを整理・検証する
#   5. src/index.ts から index.js / index.d.ts を生成し、型を検査する
#
# 生成物はすべてコミットする。利用側はコード生成もビルドもせずに依存できる。
# protoc-gen-es は .js と .d.ts を直接生成するため、tsc の対象は
# src/index.ts の 1 ファイルだけ。出力先を分けず同じディレクトリへ出す。
#
# リポジトリ直下で実行すること。

# --- 設定 ---------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"

# 生成物の配置先 (buf.gen.yaml の out と一致させること)。
GO_OUT_DIR="${PROJECT_ROOT}/gen/go"
TS_OUT_DIR="${PROJECT_ROOT}/gen/ts"
SRC_DIR="${PROJECT_ROOT}/src"

# Go モジュールはリポジトリルートに置く。サブディレクトリに置くと Go が
# `<subdir>/vX.Y.Z` という prefix 付きタグを要求し、npm 用のタグと
# 二重管理になるため。
GO_MODULE_DIR="${PROJECT_ROOT}"
GO_MODULE_NAME="github.com/yushi-a/yuxsr-dev-pb"

# protoc プラグインの固定バージョン。
# protoc-gen-es は npm の devDependencies (@bufbuild/protoc-gen-es) で固定する。
PROTOC_GEN_GO_VERSION="v1.36.11"
PROTOC_GEN_GO_GRPC_VERSION="v1.6.2"
PROTOC_GEN_CONNECT_GO_VERSION="v1.20.0"

# ローカルにインストールしたプラグインの置き場 (.gitignore 済み)。
TOOLS_BIN="${PROJECT_ROOT}/.tools/bin"

PATH="${TOOLS_BIN}:${PROJECT_ROOT}/node_modules/.bin:${PATH}"
export PATH

# --- ヘルパー -----------------------------------------------------------

require_cmd() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "❌ Error: $1 が見つかりません。$2" >&2
        exit 1
    fi
}

# 指定バージョンがすでに入っていれば go install を省略する。
go_install_plugin() {
    plugin_name="$1"
    plugin_pkg="$2"
    plugin_version="$3"

    if [ -x "${TOOLS_BIN}/${plugin_name}" ] &&
        "${TOOLS_BIN}/${plugin_name}" --version 2>&1 | grep -q "${plugin_version#v}"; then
        echo "ℹ️  ${plugin_name} ${plugin_version} は導入済みです。"
        return 0
    fi

    echo "⬇️  ${plugin_name} ${plugin_version} をインストールします..."
    GOBIN="${TOOLS_BIN}" go install "${plugin_pkg}@${plugin_version}"
}

# --- 各ステップ ---------------------------------------------------------

setup_plugins() {
    echo "🔄 protoc プラグインを準備しています..."
    require_cmd go "Go をインストールしてください。"
    require_cmd protoc-gen-es "npm install を実行してください。"

    mkdir -p "${TOOLS_BIN}"
    go_install_plugin protoc-gen-go \
        google.golang.org/protobuf/cmd/protoc-gen-go "${PROTOC_GEN_GO_VERSION}"
    go_install_plugin protoc-gen-go-grpc \
        google.golang.org/grpc/cmd/protoc-gen-go-grpc "${PROTOC_GEN_GO_GRPC_VERSION}"
    go_install_plugin protoc-gen-connect-go \
        connectrpc.com/connect/cmd/protoc-gen-connect-go "${PROTOC_GEN_CONNECT_GO_VERSION}"
    echo "✅ protoc プラグインの準備が完了しました。"
}

# 生成物を削除する。go.mod / go.sum はルートにあるため影響しない。
clean_generated() {
    echo "🧹 既存の生成物を削除しています..."
    rm -rf "${GO_OUT_DIR}" "${TS_OUT_DIR}"
    # src/ 配下は *.ts が手書きソース、*.js と *.d.ts が tsc の出力。
    find "${SRC_DIR}" -type f \( -name '*.js' -o -name '*.d.ts' \) -delete
    echo "✅ 削除が完了しました。"
}

generate_proto() {
    echo "🔄 protobuf 定義からコードを生成しています..."
    require_cmd buf "npm install を実行してください。"
    buf generate
    echo "✅ コード生成が完了しました。"
}

setup_go() {
    echo "🔄 Go モジュールを整理しています..."
    # サブシェルで実行し、スクリプトのカレントディレクトリを変えない。
    (
        cd "${GO_MODULE_DIR}"
        if [ ! -f "./go.mod" ]; then
            echo "ℹ️  go.mod がないため初期化します..."
            go mod init "${GO_MODULE_NAME}"
        fi
        go mod tidy
        go build ./...
    )
    echo "✅ Go モジュールの整理が完了しました。"
}

build_ts() {
    echo "🔄 エントリポイントを生成しています (src/index.ts -> index.js / index.d.ts)..."
    require_cmd tsc "npm install を実行してください。"
    tsc
    echo "🔄 公開面の型を検査しています..."
    tsc --noEmit -p tsconfig.test.json
    echo "✅ TypeScript の生成と型検査が完了しました。"
}

# --- エントリポイント ---------------------------------------------------

main() {
    echo "🚀 コード生成を開始します..."
    cd "${PROJECT_ROOT}"
    setup_plugins
    clean_generated
    generate_proto
    setup_go
    build_ts
    echo "🎉 コード生成が正常に完了しました！"
}

main "$@"
