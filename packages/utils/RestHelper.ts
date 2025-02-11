/** @format */

import { REST } from "#core/handler/RestHandlerConstant";
import {
    HttpCallMethod,
    HttpRequestProxyOption,
    HttpRestItem,
    HttpRestResult,
    PathEntry,
    RequestPayloadData,
    RestMappingResult,
} from "#interface";
import { MapOfType } from "@aitianyu.cn/types";

/**
 * @public
 *
 * Tianyu CSP Helper for Request
 */
export class RestHelper {
    /**
     * To get a request data from given url
     *
     * @param path the url of request
     * @param rest customized rest map
     * @param fallback customized rest fallback
     * @returns return a request rest data which defined in rest config,
     *          and null value will be returned if the url path is not mapped
     */
    public static getRest(
        path: string,
        method: HttpCallMethod,
        rest?: MapOfType<HttpRestItem>,
        fallback?: PathEntry,
    ): RestMappingResult {
        if (!path) return null;

        const restPath = path.startsWith("/") ? path : `/${path}`;
        const restData = (rest ?? REST)[restPath];
        const pathEntry = restData?.handlers?.[method]
            ? restData?.handlers[method]
            : restData?.handler
            ? restData?.handler
            : null;
        return pathEntry?.package && pathEntry?.module
            ? {
                  handler: {
                      package: pathEntry.package,
                      module: pathEntry.module,
                      method: pathEntry.method || "default",
                  },
                  cache: restData.cache,
                  proxy: restData.proxy,
              }
            : fallback
            ? { handler: fallback }
            : null;
    }

    /**
     * Convert rest item to be request processor path
     *
     * @param rest source rest item
     * @returns a path entry
     */
    public static toPathEntry(rest: HttpRestResult): PathEntry {
        if (rest.proxy && !(rest.handler.package && rest.handler.module && rest.handler.method)) {
            return {
                package: "$",
                module: "default-loader",
                method: "proxy",
            };
        }
        return {
            package: rest.handler.package || "",
            module: rest.handler.module || "",
            method: rest.handler.method || "",
        };
    }

    /**
     * Convert http request payload to transmition request payload if this request is a transmition request
     *
     * @param payload source payload
     * @param trans transmition option
     */
    public static transmit(payload: RequestPayloadData, trans?: HttpRequestProxyOption): void {
        if (!trans) {
            return;
        }

        payload.host = trans.host;
        payload.protocol = trans.protocol || "http2";
        if (payload.headers["host"]) {
            payload.headers["host"] = trans.host;
        }

        if (trans.rewrite) {
            let prefix = "";
            for (const key of Object.keys(trans.rewrite)) {
                if (payload.url.startsWith(key) && key.length > prefix.length) {
                    prefix = key;
                }
            }

            if (prefix) {
                payload.url = payload.url.replace(prefix, trans.rewrite[prefix]);
            }
        }
    }
}
