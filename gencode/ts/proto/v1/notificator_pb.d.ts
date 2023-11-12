import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";
/**
 * @generated from message proto.v1.NotifyRequest
 */
export declare class NotifyRequest extends Message<NotifyRequest> {
    /**
     * @generated from field: string message = 1;
     */
    message: string;
    constructor(data?: PartialMessage<NotifyRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "proto.v1.NotifyRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): NotifyRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): NotifyRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): NotifyRequest;
    static equals(a: NotifyRequest | PlainMessage<NotifyRequest> | undefined, b: NotifyRequest | PlainMessage<NotifyRequest> | undefined): boolean;
}
/**
 * @generated from message proto.v1.NotifyResponse
 */
export declare class NotifyResponse extends Message<NotifyResponse> {
    constructor(data?: PartialMessage<NotifyResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "proto.v1.NotifyResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): NotifyResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): NotifyResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): NotifyResponse;
    static equals(a: NotifyResponse | PlainMessage<NotifyResponse> | undefined, b: NotifyResponse | PlainMessage<NotifyResponse> | undefined): boolean;
}
