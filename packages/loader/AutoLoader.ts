/** @format */

import { REST_LOADER_RES_PATH } from "#core/handler/RestHandlerConstant";
import { NetworkServiceResponseData } from "#interface";
import path from "path";
import { htmlLoader } from "./HtmlLoader";
import { fileLoader } from "./FileLoader";

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

    const fileData = fileLoader(dir);

    return fileData ? fileData : htmlLoader(dir);
}
