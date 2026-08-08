// パッケージの公開面に対する実行時スモークテスト。
//
// package.json の "exports" 経由（自己参照 import）で読み込むことで、
// 利用側とまったく同じ経路を通す。型検査 (test/types.ts) だけでは
// 「型は通るのに実行時に壊れている」状態を検出できないため、実際に
// 読み込んで動かすこのテストが必要になる。
// (protoc-gen-es v1 系と protobuf-es v2 の組み合わせが、まさにその形で
//  壊れていた。tsc は成功し、import した瞬間に落ちる状態だった。)

import assert from 'node:assert/strict';
import test from 'node:test';

import { create, toBinary, fromBinary, toJson } from '@bufbuild/protobuf';
import {
  file_yuxsr_notification_v1_notificator,
  NotificatorService,
  NotifyRequestSchema,
  NotifyResponseSchema,
} from 'yuxsr-dev-pb';

test('公開エントリポイントが期待する export を持つ', () => {
  assert.ok(file_yuxsr_notification_v1_notificator);
  assert.ok(NotificatorService);
  assert.ok(NotifyRequestSchema);
  assert.ok(NotifyResponseSchema);
});

test('NotificatorService のディスクリプタが解決できる', () => {
  assert.equal(NotificatorService.typeName, 'yuxsr.notification.v1.NotificatorService');
  assert.equal(NotificatorService.method.notify.methodKind, 'unary');
  assert.equal(
    NotificatorService.method.notify.input.typeName,
    'yuxsr.notification.v1.NotifyRequest',
  );
  assert.equal(
    NotificatorService.method.notify.output.typeName,
    'yuxsr.notification.v1.NotifyResponse',
  );
});

test('NotifyRequest がシリアライズ/デシリアライズできる', () => {
  const req = create(NotifyRequestSchema, { message: 'こんにちは' });
  const restored = fromBinary(NotifyRequestSchema, toBinary(NotifyRequestSchema, req));

  assert.equal(restored.message, 'こんにちは');
  assert.deepEqual(toJson(NotifyRequestSchema, restored), { message: 'こんにちは' });
});

test('NotifyResponse は空メッセージとして生成できる', () => {
  const res = create(NotifyResponseSchema);
  assert.deepEqual(toJson(NotifyResponseSchema, res), {});
});

test('生成コード (gen/) は exports で隠蔽されている', async () => {
  await assert.rejects(
    () => import('yuxsr-dev-pb/gen/ts/yuxsr/notification/v1/notificator_pb.js'),
    /ERR_PACKAGE_PATH_NOT_EXPORTED/,
    '内部の生成コードが外部から参照できてしまっています',
  );
});
