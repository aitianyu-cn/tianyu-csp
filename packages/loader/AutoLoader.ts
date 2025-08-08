/** @format */

import { REST_LOADER_RES_PATH } from "#core/handler/RestHandlerConstant";
import { HTTP_STATUS_CODE, NetworkServiceResponseData } from "#interface";
import path from "path";
import { htmlLoader } from "./HtmlLoader";
import { fileLoader } from "./FileLoader";
import { HttpHelper } from "#utils";
import { StringHelper } from "@aitianyu.cn/types";
import { LOADER_IGNORE_PATTERN, REST_CONFIG } from "packages/Common";

/**
 * @internal
 *
 * To load a file from request url path and package it to be network service response data
 *
 * @returns return a response data
 */
export function loader(): NetworkServiceResponseData {
    if (LOADER_IGNORE_PATTERN.test(TIANYU.request.url)) {
        return REST_CONFIG?.errorpage?.[403]
            ? {
                  statusCode: HTTP_STATUS_CODE.TEMPORARY_REDIRECT,
                  headers: {
                      Location: StringHelper.format(REST_CONFIG?.errorpage?.[403], [
                          TIANYU.request.url,
                          HttpHelper.stringifyParam(TIANYU.request.allParams()),
                      ]),
                  },
                  body: null,
              }
            : /* istanbul ignore next */ {
                  statusCode: HTTP_STATUS_CODE.FORBIDDEN,
                  headers: {},
                  body: null,
              };
    }

    const url_path = TIANYU.request.url || /* istanbul ignore next */ "/";
    const dir = path.join(REST_LOADER_RES_PATH, url_path);

    const fileData = fileLoader(dir);

    return fileData ? fileData : htmlLoader(dir);
}
