/** @format */

import { HttpCallMethod, HttpProtocal } from "#interface";
import { AbstractHttpClient } from "./AbstractHttpClient";

export const HTTP_CLIENT_MAP: {
    [key in HttpProtocal]: (locate: string, path: string, method: HttpCallMethod) => AbstractHttpClient;
} = {
    http: (locate: string, path: string, method: HttpCallMethod) => {
        return new TIANYU.import.MODULE.HttpClient(locate, path, method);
    },
    https: (locate: string, path: string, method: HttpCallMethod) => {
        return new TIANYU.import.MODULE.HttpsClient(locate, path, method);
    },
    http2: (locate: string, path: string, method: HttpCallMethod) => {
        return new TIANYU.import.MODULE.Http2Client(locate, path, method);
    },
};
