// 公開面の型レベルテスト。
// 利用側とまったく同じ自己参照 import (from 'yuxsr-dev-pb') で読み込むため、
// package.json の "exports" と生成された index.d.ts を経由して解決される。
// 「公開面が利用側から正しく見えるか」を型レベルで検証する。
// (`npm run typecheck` で実行。実行時側の検証は test/smoke.test.js が担当する。)

import type { Client } from '@connectrpc/connect';
import { create } from '@bufbuild/protobuf';
import {
  file_yuxsr_notification_v1_notificator,
  NotificatorService,
  NotifyRequestSchema,
  NotifyResponseSchema,
  type NotifyRequest,
  type NotifyResponse,
} from 'yuxsr-dev-pb';

// 値としての export が解決できること。
export const descriptors = [
  file_yuxsr_notification_v1_notificator,
  NotificatorService,
  NotifyRequestSchema,
  NotifyResponseSchema,
];

// メッセージ型が生成コードの型と一致すること。
export const request: NotifyRequest = create(NotifyRequestSchema, { message: 'hello' });
export const response: NotifyResponse = create(NotifyResponseSchema);

// サービスディスクリプタが Connect のクライアント型に渡せること。
export type NotificatorClient = Client<typeof NotificatorService>;

// RPC のシグネチャが期待どおりであること。
export async function notify(client: NotificatorClient): Promise<NotifyResponse> {
  return client.notify(create(NotifyRequestSchema, { message: 'hello' }));
}
