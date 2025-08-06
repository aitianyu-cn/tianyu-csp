/** @format */

import { REST_LOADER_RES_PATH } from "#core/handler/RestHandlerConstant";
import { HTTP_STATUS_CODE, NetworkServiceResponseData } from "#interface";
import { HttpHelper } from "#utils";
import { StringHelper } from "@aitianyu.cn/types";
import { LOADER_IGNORE_PATTERN, REST_CONFIG } from "packages/Common";
import path from "path";

const DEFAULT_EMPTY_HTML = `<!DOCTYPE html><html lang="en"><head></head><body></body></html>`;

/**
 * @internal
 *
 * To load a html file from request url path and package it to be network service response data
 *
 * @returns return a html response data
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
                  body: DEFAULT_EMPTY_HTML,
              };
    }

    const url_path = TIANYU.request.url || /* istanbul ignore next */ "/";
    const dir = path.join(REST_LOADER_RES_PATH, url_path);
    return htmlLoader(dir);
}

export function htmlLoader(dir: string): NetworkServiceResponseData {
    let body = TIANYU.import.html(dir);
    let statusCode = HTTP_STATUS_CODE.OK;
    if (!body) {
        statusCode = HTTP_STATUS_CODE.NOT_FOUND;
        body = DEFAULT_EMPTY_HTML;

        if (REST_CONFIG?.errorpage?.[404]) {
            return {
                statusCode: HTTP_STATUS_CODE.TEMPORARY_REDIRECT,
                headers: {
                    Location: StringHelper.format(REST_CONFIG?.errorpage?.[404], [
                        TIANYU.request.url,
                        HttpHelper.stringifyParam(TIANYU.request.allParams()),
                    ]),
                },
                body: null,
            };
        }
    }

    return {
        statusCode,
        headers: {
            "Content-Type": "text/html",
        },
        body,
    };
}
