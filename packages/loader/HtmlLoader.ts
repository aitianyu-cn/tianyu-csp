/** @format */

import { REST_LOADER_RES_PATH } from "#core/handler/RestHandlerConstant";
import { HTTP_STATUS_CODE, NetworkServiceResponseData } from "#interface";
import path from "path";

/**
 * @internal
 *
 * To load a html file from request url path and package it to be network service response data
 *
 * @returns return a html response data
 */
export function loader(): NetworkServiceResponseData {
    const url_path = TIANYU.request.url || /* istanbul ignore next */ "/";
    const dir = path.join(REST_LOADER_RES_PATH, url_path);
    return {
        statusCode: HTTP_STATUS_CODE.OK,
        headers: {
            "Content-Type": "text/html",
        },
        body: TIANYU.import.html(dir),
    };
}
