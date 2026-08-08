# yuxsr-dev-pb

`yuxsr-dev` プロジェクトの各サービスが共有する Protocol Buffers 定義と、そこから生成した
Go / TypeScript のクライアント・サーバコードを管理するリポジトリです。

## 構成

**手書きは 2 つだけ、それ以外はすべて生成物でコミットします。**
利用側はコード生成もビルドもせずに依存できます。

| パス | 種別 | 内容 |
| --- | --- | --- |
| `proto/yuxsr/notification/v1/*.proto` | **手書き** | サービス定義 |
| `src/index.ts` | **手書き** | 公開エントリポイント |
| `gen/go/`, `gen/ts/` | 生成 | `buf generate` の出力 |
| `src/index.js`, `src/index.d.ts` | 生成 | `src/index.ts` を `tsc` でコンパイルしたもの |

`protoc-gen-es` は `target=js+dts` で `.js` と `.d.ts` を直接生成するため、
`tsc` の対象は `src/index.ts` の 1 ファイルだけです。1 ファイルなので出力先を
分ける必要がなく、`dist/` のような 2 つ目の出力ディレクトリを持ちません。

利用側の `npm install` ではビルドが走らず、devDependencies も取得されません
（`build` / `prepare` といった npm がビルド要と判断するスクリプト名を避けているため。
詳細は AGENTS.md を参照）。

CI が「再生成した結果とコミット内容が一致すること」を検証します。

## 前提ツール

| ツール | 用途 |
| --- | --- |
| Node.js 20 以上 | buf CLI・protoc-gen-es・TypeScript の実行 |
| Go 1.25 以上 | protoc プラグイン（Go 製）のビルドと Go モジュールの整理 |

buf CLI と protoc プラグインはすべて `npm install` および `generate.sh` が自動で用意するため、
グローバルへのインストールは不要です。protoc 本体も不要です（buf が内蔵のコンパイラを使います）。

```bash
npm install
```

## 使い方

### コード生成

`.proto` を変更したら必ず実行し、生成された差分もあわせてコミットしてください。

```bash
npm run generate   # または make generate
```

以下が順に実行されます。

1. `protoc-gen-go` / `protoc-gen-go-grpc` / `protoc-gen-connect-go` を `.tools/bin` に固定バージョンでインストール
2. `gen/` を削除
3. `buf generate` で Go / TypeScript を生成
4. `go mod tidy` と `go build` で Go モジュールを検証
5. `tsc` で `src/index.ts` から `index.js` / `index.d.ts` を生成し、公開面の型を検査

### その他のコマンド

```bash
make help          # 一覧を表示
make verify        # CI と同等の検証を一括実行
make compile       # src/index.ts から index.js / index.d.ts を生成
make lint          # buf lint
make format        # buf format -w
make breaking      # main に対する破壊的変更の検出
make test          # スモークテスト
```

## 利用側からの参照

### Go

```bash
go get github.com/yushi-a/yuxsr-dev-pb
```

Connect のハンドラ（`notificationv1connect`）と gRPC のスタブ（`notificationv1`）の
両方を提供しています。**サーバ実装には Connect のハンドラを推奨**します。
Connect / gRPC / gRPC-Web を同一ポートでさばけるため、ブラウザからも既存の
gRPC クライアントからも呼べます。素の `grpc.NewServer()` は Connect プロトコルを
受け付けないため、ブラウザから直接呼べません。

```go
import (
	notificationv1 "github.com/yushi-a/yuxsr-dev-pb/gen/go/yuxsr/notification/v1"
	"github.com/yushi-a/yuxsr-dev-pb/gen/go/yuxsr/notification/v1/notificationv1connect"
)

// Connect ハンドラは Connect / gRPC / gRPC-Web を同一ポートでさばく。
mux := http.NewServeMux()
mux.Handle(notificationv1connect.NewNotificatorServiceHandler(svc))

// h2c で TLS なしの HTTP/2 を受ける (gRPC クライアント互換のため)。
http.ListenAndServe(":8080", h2c.NewHandler(mux, &http2.Server{}))
```

> **`go.mod` をルートに置く理由**: Go はサブディレクトリのモジュールに
> `<subdir>/vX.Y.Z` という prefix 付きタグを要求し、prefix を設定で変える手段はありません。
> ルートに置くことで npm と同じ `vX.Y.Z` タグ 1 系統で運用できます。

### TypeScript

```jsonc
// package.json
"dependencies": {
  "yuxsr-dev-pb": "github:yushi-a/yuxsr-dev-pb#v0.3.0"
}
```

```ts
import { create } from '@bufbuild/protobuf';
import { createClient } from '@connectrpc/connect';
import { NotificatorService, NotifyRequestSchema } from 'yuxsr-dev-pb';

const client = createClient(NotificatorService, transport);
await client.notify(create(NotifyRequestSchema, { message: 'hello' }));
```

公開しているのは以下だけです。`gen/` 配下は `exports` により参照できません。

| export | 種別 | 用途 |
| --- | --- | --- |
| `NotificatorService` | 値 | `createClient` / `ConnectRouter.service` に渡すサービスディスクリプタ |
| `NotifyRequestSchema` / `NotifyResponseSchema` | 値 | `create()` などに渡すメッセージスキーマ |
| `NotifyRequest` / `NotifyResponse` | 型 | メッセージの型注釈 |
| `file_yuxsr_notification_v1_notificator` | 値 | ファイルディスクリプタ |

このパッケージは **ESM のみ**を提供します（`@bufbuild/protobuf` / `@connectrpc/connect` に合わせています）。
CommonJS から使う場合は Node.js 22.12 以上の `require(esm)` を利用してください。

> **公開面を増やすとき**: `src/index.ts` に再エクスポートを追記し、`npm run generate`
> で `index.js` / `index.d.ts` を生成し直してコミットしてください。
> あわせて `test/smoke.test.js`（実行時）と `test/types.ts`（型）にも追記します。

## リリース

タグは **`vX.Y.Z` の 1 系統のみ**です。npm と Go の両方がこのタグを参照します。

1. `package.json` の `version` を更新してコミットする
2. 同じコミットに `vX.Y.Z` タグを打って push する
3. `.github/workflows/release.yml` が検証を実行し、通れば GitHub Release を作成する

リリース workflow はタグと `package.json` の `version` の一致、生成物が最新であること、
`npm pack` した配布物に必要なファイルが含まれることまで確認します。検証に失敗した場合、
リリースは作成されません。

> `gencode/go/yuxsr_dev_pb/vX.Y.Z` 形式の古い Go 用タグは `v0.2.0` までの互換のために残しています。
> 新しいリリースでは使いません。

## CI

`.github/workflows/ci.yml` で以下を検証しています。

- `buf lint` / `buf format --diff --exit-code`
- PR では base ブランチに対する `buf breaking`
- 再生成した結果がコミット済みの生成物と一致すること
- `go vet` と TypeScript のスモークテスト

ローカルでも `make verify` で同等の検証を実行できます。
