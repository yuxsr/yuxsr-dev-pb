import { NotifyRequest, NotifyResponse } from "./notificator_pb.js";
import { MethodKind } from "@bufbuild/protobuf";
/**
 * @generated from service proto.v1.NotificatorService
 */
export declare const NotificatorService: {
    readonly typeName: "proto.v1.NotificatorService";
    readonly methods: {
        /**
         * @generated from rpc proto.v1.NotificatorService.Notify
         */
        readonly notify: {
            readonly name: "Notify";
            readonly I: typeof NotifyRequest;
            readonly O: typeof NotifyResponse;
            readonly kind: MethodKind.Unary;
        };
    };
};
