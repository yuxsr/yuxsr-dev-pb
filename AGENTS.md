# リポジトリガイドライン

このリポジトリは、`yuxsr-dev` の各サービスが利用する Protocol Buffers 定義と生成済みのクライアント／サーバースタブを管理します。変更は常に再現性を保ち、コード生成を決定的にし、API やツールの調整時には利用側への影響を意識してください。

## プロジェクト構成とモジュール

**手書きは 2 つだけです。それ以外はすべて生成物で、すべてコミットします。**

手書き:
- `proto/yuxsr/notification/v1/*.proto`: サービス定義。変更の起点はほぼ常にここです。
- `src/index.ts`: 公開エントリポイント。公開面を増やすときはここに再エクスポートを追記します。

生成物（**編集禁止**、`npm run generate` で作り直す）:
- `gen/go/`, `gen/ts/`: `buf generate` の出力。
- `src/index.js`, `src/index.d.ts`: `src/index.ts` を `tsc` でコンパイルしたもの。`src/` 内で `.ts` は手書き、`.js` と `.d.ts` は生成物です。

ツールと設定（手書き）:
- `generate.sh`: 生成パイプライン本体。protoc プラグインの用意 → 生成物の削除 → `buf generate` → `go mod tidy` / `go build` → `tsc` を一括実行します。リポジトリ直下で実行してください。
- `test/`: `smoke.test.js`（実行時）と `types.ts`（型）。
- `go.mod` / `go.sum`: **リポジトリルート**に置きます（依存は `go mod tidy` が管理）。サブディレクトリのモジュールは Go が `<subdir>/vX.Y.Z` という prefix 付きタグを要求し、npm 用タグと二重管理になるためです。prefix を設定で変える手段はありません。
- `.tools/`: `generate.sh` が protoc プラグインを配置する作業ディレクトリ（gitignore 済み）。

## ビルド／テスト／開発コマンド

- `npm install`: buf CLI、`protoc-gen-es`、TypeScript を導入します。
- `make verify`: CI と同等の検証（lint / format / 再生成の差分 / go vet / テスト）を一括実行します。PR 前にこれを通してください。
- `npm run generate` / `make generate`: 生成パイプライン全体を実行します。
- `make lint`: `buf lint` で proto ツリーを検証します。PR 前に実行してください。
- `make format`: `buf format -w` により proto の書式を正規化します。
- `make breaking`: `main` に対する破壊的変更を検出します。
- `npm run compile`: `src/index.ts` から `index.js` / `index.d.ts` を生成します。
- `npm run typecheck`: `tsconfig.test.json` で `test/types.ts` を検査し、公開面が利用側から正しく見えるかを確認します。
- `npm test`: ビルド → 型検査 → スモークテストを実行します。

## コード生成の方針

- **リモートプラグイン（buf.build）は使いません。** BSR への到達性が必須になり、制限されたネットワークや CI で再生成できなくなるためです。プラグインはすべてローカルで、バージョンは `generate.sh`（Go 側）と `package.json`（`@bufbuild/protoc-gen-es`）で固定しています。更新時は両方を確認してください。
- **`buf.gen.yaml` の `clean: true` は使いません。** 出力ディレクトリを丸ごと消すため、Go モジュールのメタデータを巻き込む危険があります。削除は `generate.sh` が対象を限定して行います。
- **Go のモジュールパスは 2 か所で一致している必要があります**: `generate.sh` の `GO_MODULE_NAME` と ルートの `go.mod` の `module`（どちらも `github.com/yushi-a/yuxsr-dev-pb`）。リポジトリ名は `yuxsr-dev-pb`（ハイフン）です。
- **出力先を変えるときは 2 か所**: `buf.gen.yaml` の `out` と `generate.sh` の `GO_OUT_DIR` / `TS_OUT_DIR`。`buf.gen.yaml` の `go_package_prefix` も出力先に追従させてください（Go の import パスが決まります）。
- `.proto` に `option go_package` は書きません。managed mode が付与するため二重管理になります。
- protobuf-es v2 以降、サービスディスクリプタは生成ファイル本体に含まれます。別途 connect-es の codegen プラグインは不要です（v1 系プラグインは protobuf-es v2 と互換性がなく、型チェックを素通りして実行時に壊れます）。
- **Go は gRPC スタブと Connect ハンドラの両方を生成します。** サーバ実装には Connect（`notificationv1connect`）を使ってください。素の `grpc.NewServer()` は Connect プロトコルを受け付けず、ブラウザ（connect-web）から呼べません。gRPC スタブは既存利用のために残しています。
- **`protoc-gen-es` の `target` は `js+dts` です。`ts` に戻さないでください。** `ts` にすると `gen/ts/` 配下の全ファイルが tsc のコンパイル対象になり、同じディレクトリに `.ts` / `.js` / `.d.ts` が並ぶか、`dist/` のような 2 つ目の出力ディレクトリが必要になります。`js+dts` なら tsc の対象は `src/index.ts` の 1 ファイルだけで済みます。
- **`tsconfig.json` は `include` ではなく `files` を使っています。** glob にすると生成された `src/index.d.ts` 自身が入力に含まれ、「出力が入力を上書きする」エラーになります。型検査専用の設定は `tsconfig.test.json` に分けています。
- **`package.json` の `scripts` に `build` / `prepare` / `prepack` / `install` / `postinstall` を置かないでください。** npm はこれらの名前があると「git 依存はソースからビルドが必要」と判断し、利用側で devDependencies（`@bufbuild/buf` を含む）を取得します。実測で取得量が **572KB → 48MB** に増えました。TypeScript のコンパイルスクリプトを `build` ではなく `compile` という名前にしているのはこのためです。**`build` に戻さないでください。**

## コーディングスタイルと命名規約

- Proto は buf の `STANDARD` lint プロファイルに従います。パッケージ名は `<組織>.<ドメイン>.<版>`（例: `yuxsr.notification.v1`）とし、ディレクトリ構成と一致させます。フィールド名は `snake_case` です。ドメインごとにパッケージを分け、単一の `v1` に集約しないでください。
- 生成された Go コードは `gofmt` 準拠です。独自のヘルパーが必要な場合は `gen/` 外に配置してください。
- 生成物は `.gitattributes` で `linguist-generated=true` にしてあります。レビュー時は差分が折りたたまれます。
- TypeScript は **ESM のみ**を提供します（`package.json` の `"type": "module"`）。相対 import には `.js` 拡張子が必要です。
- `gen/` 配下は `package.json` の `exports` により外部から参照できません。公開したいものは必ず `src/index.ts` を経由させてください。この隠蔽は `test/smoke.test.js` が検証しています。

## テスト指針

- `test/smoke.test.js`（実行時）と `test/types.ts`（型）がリグレッション検知の基盤です。テストは `exports` 経由の自己参照 import（`from 'yuxsr-dev-pb'`）で読み込むため、利用側とまったく同じ経路を通ります。型チェックをすり抜けて実行時にだけ壊れる不整合を捕捉することが目的なので、公開面を追加したらここにも追記してください。
- Proto を更新した際は `make lint` と `npm run generate` を必ず実行し、Go／TypeScript の生成物の差分をあわせてコミットしてください。CI は再生成結果とコミット内容の一致を検証します。

## 破壊的変更

- CI は PR で `buf breaking` を実行します。**意図的な破壊的変更を入れる場合は PR に `breaking-change` ラベルを付けてください。** ラベルがある場合のみこのチェックをスキップします。
- `buf.yaml` に恒久的な除外設定（`ignore`）は書かないでください。ラベルを必須にしているのは、破壊的変更を無自覚に入れられないようにするためです。
- proto のパッケージ名は RPC の URL パス（`/yuxsr.notification.v1.NotificatorService/Notify`）に現れます。変更するとサーバとクライアントの同時デプロイが必要です。

## リリース

- タグは **`vX.Y.Z` の 1 系統のみ**です。npm・Go の両方がこれを参照します。`gencode/go/yuxsr_dev_pb/vX.Y.Z` 形式は `v0.2.0` までの互換用で、新規には使いません。
- タグを打つ前に `package.json` の `version` を同じ番号に更新してください。`release.yml` が一致を検証し、ずれているとリリースを中止します。
- 手でタグを打っただけではリリースになりません。`release.yml` の検証（再生成の差分ゼロ、スモークテスト、配布物の内容確認）を通す必要があります。壊れた `v0.1.1` がリリースされた経緯があるため、この検証は省略しないでください。

## コミットとプルリクエスト

- Git ログで採用されている形式に合わせ、先頭に絵文字（例: `:sparkles:`, `:art:`, `:arrow_up:`）を置き、続けて簡潔な命令形サマリー（例: `:sparkles: add notification proto`）を 72 文字以内で記述します。
- `gen/` の生成物は必ずコミットに含めてください。利用側はコード生成なしにこのリポジトリへ依存します。
- プルリクエストでは API 変更内容、影響を受けるサービス、必要に応じた buf の breaking-change 出力を記載し、関連 Issue をリンクしてください。UI に影響する場合のみスクリーンショットを添付します。

## コミュニケーションルール

- レビューコメント、Issue、PR 説明、ドキュメント更新のすべてで日本語を用いてください。翻訳が難しい専門用語は英単語を併記しても構いません。
