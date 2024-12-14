/** @format */

import { HTTP_STATUS_CODE, NetworkServiceResponseData } from "#interface";
import { REST_LOADER_RES_PATH } from "../Common";
import path from "path";

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
