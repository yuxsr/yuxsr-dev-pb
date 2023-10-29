// @generated by protoc-gen-es v1.4.1 with parameter "target=ts"
// @generated from file proto/v1/notificator.proto (package proto.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message proto.v1.NotifyRequest
 */
export class NotifyRequest extends Message<NotifyRequest> {
  /**
   * @generated from field: string message = 1;
   */
  message = "";

  constructor(data?: PartialMessage<NotifyRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "proto.v1.NotifyRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "message", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): NotifyRequest {
    return new NotifyRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): NotifyRequest {
    return new NotifyRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): NotifyRequest {
    return new NotifyRequest().fromJsonString(jsonString, options);
  }

  static equals(a: NotifyRequest | PlainMessage<NotifyRequest> | undefined, b: NotifyRequest | PlainMessage<NotifyRequest> | undefined): boolean {
    return proto3.util.equals(NotifyRequest, a, b);
  }
}

/**
 * @generated from message proto.v1.NotifyResponse
 */
export class NotifyResponse extends Message<NotifyResponse> {
  constructor(data?: PartialMessage<NotifyResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "proto.v1.NotifyResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): NotifyResponse {
    return new NotifyResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): NotifyResponse {
    return new NotifyResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): NotifyResponse {
    return new NotifyResponse().fromJsonString(jsonString, options);
  }

  static equals(a: NotifyResponse | PlainMessage<NotifyResponse> | undefined, b: NotifyResponse | PlainMessage<NotifyResponse> | undefined): boolean {
    return proto3.util.equals(NotifyResponse, a, b);
  }
}
