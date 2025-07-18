/** @format */

import { DEFAULT_REQUEST_LANGUAGE_ITEM } from "#core/Constant";
import { AreaCode, getBoolean, MapOfString, MapOfStrings, MapOfType, parseAreaString } from "@aitianyu.cn/types";
import { IncomingHttpHeaders } from "http";
import { URLSearchParams } from "url";

/**
 * @internal
 *
 * To parse a language string which from request header accept to be a valid tianyu language string
 *
 * @param acceptLang language from request header
 * @returns return a formatted accept language
 */
function parseAcceptLanguage(acceptLang: string): string {
    const langItems = acceptLang.split(";");
    const firstItem = langItems[0];
    if (!!firstItem) {
        const languagePair = firstItem.split(",");
        if (languagePair.length !== 0) {
            const language = languagePair[0];
            const formattedLanguage = language.replace("-", "_").trim();

            return formattedLanguage;
        }
    }

    return "";
}

/**
 * @public
 *
 * Tianyu CSP helper for HTTP
 */
export class HttpHelper {
    /**
     * To handle request search parameters from request url and convert them to be a string map
     *
     * @param url source url
     * @returns return a map of all search parameter items
     */
    public static processParameters(url: string): MapOfStrings {
        const param: MapOfStrings = {};

        const originUrl = url || "";
        const urlParam = originUrl.split("?");
        if (urlParam.length > 1) {
            try {
                const querySearcher = new URLSearchParams(urlParam[1]);
                for (const [key, value] of querySearcher) {
                    if (!param[key]) {
                        param[key] = [];
                    }
                    param[key].push(value);
                }
            } catch {
                //
            }
        }

        return param;
    }

    /**
     * To handle request cookie and convert them to be a string map
     *
     * @param cookie cookie definition from request
     * @returns return a map of all cookie items
     */
    public static processCookie(cookie: string): MapOfString {
        const parsedCookie: MapOfString = {};

        const cookieItems = cookie.split(";");
        for (const item of cookieItems) {
            const processedItem = item.trim();
            const pair = processedItem.split("=");
            if (pair.length > 1) {
                const key = pair[0];
                pair.shift();
                parsedCookie[key] = pair.join("=").trim();
            }
        }

        return parsedCookie;
    }

    /**
     * To handle request header and convert them to be a string map, if there is an array of a
     * header item, the array will be joined by "%%%".
     *
     * @param header header of request
     * @returns return a map of all header items
     */
    public static processHeader(header: IncomingHttpHeaders): MapOfStrings {
        const newHeader: MapOfStrings = {};

        for (const key of Object.keys(header)) {
            const value = header[key];
            if (value) {
                newHeader[key] = typeof value === "string" ? [value] : value;
            }
        }

        return newHeader;
    }

    /**
     * To get a valid area and language of request
     *
     * @param cookies coverted request cookies map
     * @param params converted request url searches map
     * @param headers converted request headers map
     * @param defaultNameForCookie the default language item key in cookie
     * @param defaultNameForParam the default language item key in url search parameter
     * @returns return a language area value which contains in cookie, search parameter or header,
     *          and a 'unknown' language area will be returned if no tianyu valid language string
     *          is found.
     */
    public static processLanguage(
        cookies: MapOfString,
        params: MapOfStrings,
        headers: IncomingHttpHeaders,
        defaultNameForCookie?: string,
        defaultNameForParam?: string,
    ): AreaCode {
        const paramsLanguage = params[defaultNameForParam || DEFAULT_REQUEST_LANGUAGE_ITEM] || "";
        const cookieLanguage = cookies[defaultNameForCookie || DEFAULT_REQUEST_LANGUAGE_ITEM.toUpperCase()] || "";
        const acceptLanguage = parseAcceptLanguage(headers["accept-language"] || "");

        const language = paramsLanguage?.[0] || cookieLanguage || acceptLanguage;

        return language ? parseAreaString(language, true) : AreaCode.unknown;
    }

    /**
     * To convert cookies map as a string
     *
     * @param cookies source cookie map
     * @returns return a string of cookie map
     */
    public static stringifyCookie(cookies: MapOfString): string {
        const cookiePair: string[] = [];
        for (const key of Object.keys(cookies)) {
            cookies[key] !== undefined && cookiePair.push(`${key}=${cookies[key]}`);
        }
        return cookiePair.length ? `${cookiePair.join(";")};` : "";
    }

    /**
     * To convert parameters map as a url search string
     *
     * @param param source parameters map
     * @returns return a search string of parameters map
     */
    public static stringifyParam(param: MapOfType<string | string[]>): string {
        const paramPair: string[] = [];
        for (const key of Object.keys(param)) {
            if (Array.isArray(param[key])) {
                for (const item of param[key]) {
                    paramPair.push(`${key}=${item}`);
                }
            } else {
                paramPair.push(`${key}=${param[key]}`);
            }
        }
        return paramPair.length ? `?${paramPair.join("&")}` : "";
    }

    public static parseHost(host: string): { host: string; port?: number } {
        const hostPair = host.split(":");
        const portNumber = Number(hostPair[1]);
        return {
            host: hostPair[0],
            port: Number.isInteger(portNumber) ? portNumber : undefined,
        };
    }

    /**
     * To get a flag indicates the authorization should be force checked for security http connect.
     *
     * @returns return true if should force authorization checking
     */
    public static shouldRejectUnauth(): boolean {
        return !getBoolean((global as any).TIANYU_TEST_HTTPS_UNAUTH);
    }
}
