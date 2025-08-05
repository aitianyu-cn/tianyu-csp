/** @format */

import { REST_LOADER_RES_PATH } from "#core/handler/RestHandlerConstant";
import { HTTP_STATUS_CODE, NetworkServiceResponseData } from "#interface";
import { HttpHelper } from "#utils";
import { StringHelper } from "@aitianyu.cn/types";
import fs from "fs";
import { MIME_FILE_BINARY_LIST, MIME_FILE_CONTENT_MAP, MIME_FILE_TYPE_MAP, REST_CONFIG } from "../Common";
import path from "path";

export function loader(): NetworkServiceResponseData {
    const url_path = TIANYU.request.url || /* istanbul ignore next */ "/";
    const dir = path.join(REST_LOADER_RES_PATH, url_path);

    const response = internalLoader(dir);

    return (
        response || /* istanbul ignore next */ {
            statusCode: HTTP_STATUS_CODE.NOT_FOUND,
            headers: { "Content-Type": "text/html" },
            body: null,
        }
    );
}

export function internalLoader(dir: string): NetworkServiceResponseData | null {
    const response = fileLoader(dir);
    if (!response) {
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

    return response;
}

export function fileLoader(dir: string): NetworkServiceResponseData | null {
    const bDirectFile = fs.existsSync(dir) && fs.lstatSync(dir).isFile();
    if (bDirectFile) {
        const sp = dir.split(".");
        const type = (sp[sp.length - 1 || 1] || "text").toLowerCase();
        const file = fs.readFileSync(dir);
        const binary = MIME_FILE_BINARY_LIST.includes(type);
        return {
            statusCode: HTTP_STATUS_CODE.OK,
            headers: {
                "Content-Type": `${MIME_FILE_CONTENT_MAP[type] || "application"}/${MIME_FILE_TYPE_MAP[type] || type}`,
            },
            body: binary ? file.toString("base64") : file.toString("utf-8"),
            binary,
        };
    }

    return null;
}
