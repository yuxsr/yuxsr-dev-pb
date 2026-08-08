// このパッケージの公開面。
// 生成コード (gen/) は内部実装であり、package.json の "exports" により
// 外部からは参照できない。利用側は必ずこのエントリポイント経由で import する。
//
// このファイルが唯一の手書きソース。tsc が同じディレクトリに
// index.js と index.d.ts を生成し、それが配布物になる。

export {
  file_yuxsr_notification_v1_notificator,
  NotifyRequestSchema,
  NotifyResponseSchema,
  NotificatorService,
} from '../gen/ts/yuxsr/notification/v1/notificator_pb.js';

// protobuf-es v2 のメッセージは型のみ。実体の生成には `create(NotifyRequestSchema)` を使う。
export type {
  NotifyRequest,
  NotifyResponse,
} from '../gen/ts/yuxsr/notification/v1/notificator_pb.js';
