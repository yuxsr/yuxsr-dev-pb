"use strict";
// @generated by protoc-gen-connect-es v1.1.3 with parameter "target=ts"
// @generated from file proto/v1/notificator.proto (package proto.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificatorService = void 0;
const notificator_pb_js_1 = require("./notificator_pb.js");
const protobuf_1 = require("@bufbuild/protobuf");
/**
 * @generated from service proto.v1.NotificatorService
 */
exports.NotificatorService = {
    typeName: "proto.v1.NotificatorService",
    methods: {
        /**
         * @generated from rpc proto.v1.NotificatorService.Notify
         */
        notify: {
            name: "Notify",
            I: notificator_pb_js_1.NotifyRequest,
            O: notificator_pb_js_1.NotifyResponse,
            kind: protobuf_1.MethodKind.Unary,
        },
    }
};
