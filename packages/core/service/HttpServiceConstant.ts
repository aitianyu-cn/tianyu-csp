/** @format */

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
                    message: "Request method handler is not found, please ensure your http request uses correct method.",
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
                    message: `Request "${payload.url}" is not accessiable, please check url and retry later.`,
                    error: `Request '${payload.method}' => "${payload.host}${payload.url}" could not be executed due to request url handler does not exist or the method handler of this url is not configered.`,
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
                    message: error?.error.message || "Technical error occurs when processing request.",
                    error: error?.error.error,
                },
            ],
        },
    }),
};
