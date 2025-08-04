/** @format */

import { REST_LOADER_RES_PATH } from "#core/handler/RestHandlerConstant";
import { HTTP_STATUS_CODE, NetworkServiceResponseData } from "#interface";
import { MapOfString } from "@aitianyu.cn/types";
import fs from "fs";
import path from "path";

const FILE_TYPE_MAP: MapOfString = {
    css: "css",
    js: "javascript",
    ico: "x-icon",
};

const FILE_CONTENT_TYPE: MapOfString = {
    css: "text",
    js: "application",
    gif: "image",
    png: "image",
    jpg: "image",
    ico: "image",
};

const FILE_BINARY_LIST = ["gif", "png", "jpg", "ico"];

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
    if (fs.lstatSync(dir).isFile()) {
        const sp = dir.split(".");
        const type = (sp[sp.length - 1] || "text").toLocaleLowerCase();
        const file = fs.readFileSync(dir);
        return {
            statusCode: HTTP_STATUS_CODE.OK,
            headers: {
                "Content-Type": `${FILE_CONTENT_TYPE[type] || "application"}/${FILE_TYPE_MAP[type] || type}`,
            },
            body: Array.from(file),
            binary: FILE_BINARY_LIST.includes(type),
        };
    }

    return {
        statusCode: HTTP_STATUS_CODE.OK,
        headers: {
            "Content-Type": "text/html",
        },
        body: TIANYU.import.html(dir),
    };
}
