/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { HTTP_STATUS_CODE, RequestPayloadData } from "#interface";
import { ErrorHelper } from "#utils";

export const DISPATCH_ERROR_RESPONSES = {
    "dispatch-invalid": (_payload: RequestPayloadData) => ({
        statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: {
            error: [
                {
                    code: SERVICE_ERROR_CODES.REQUEST_METHOD_NOT_SUPPORT,
                    message: MessageBundle.text("ERROR_CORE_SERVICE_NET_HTTP_INVALID_CALL"),
                },
            ],
        },
    }),
    "rest-not-found": (payload: RequestPayloadData) => ({
        statusCode: HTTP_STATUS_CODE.NOT_FOUND,
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: {
            error: [
                {
                    code: SERVICE_ERROR_CODES.REQUEST_PATH_INVALID,
                    message: MessageBundle.text("ERROR_CORE_SERVICE_NET_HTTP_REST_NOT_FOUND", payload.url),
                    error: MessageBundle.text(
                        "ERROR_CODE_SERVICE_NET_HTTP_REST_NOT_FOUND_DET",
                        payload.method,
                        payload.host,
                        payload.url,
                    ),
                },
            ],
        },
    }),
    "dispatch-request-error": (_payload: RequestPayloadData, error: any) => ({
        statusCode: ErrorHelper.getHttpStatusByJobStatus(error?.status),
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: {
            error: [
                {
                    code: error?.error.code || SERVICE_ERROR_CODES.INTERNAL_ERROR,
                    message: error?.error.message || MessageBundle.text("ERROR_CODE_SERVICE_NET_HTTP_GENERAL_ERROR"),
                    error: error?.error.error,
                },
            ],
        },
    }),
};
