/** @format */

import { AreaCode, MapOfString, parseAreaString } from "@aitianyu.cn/types";
import { IncomingHttpHeaders } from "http";
import { URLSearchParams } from "url";

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

export class HttpHelper {
    public static processParameters(url: string): MapOfString {
        const param: MapOfString = {};

        const originUrl = url || "";
        const urlParam = originUrl.split("?");
        if (urlParam.length > 1) {
            try {
                const querySearcher = new URLSearchParams(urlParam[1]);
                for (const [key, value] of querySearcher) {
                    param[key] = value;
                }
            } catch {
                //
            }
        }

        return param;
    }

    public static processCookie(cookie: string): MapOfString {
        const parsedCookie: MapOfString = {};

        const cookieItems = cookie.split(";");
        for (const item of cookieItems) {
            const processedItem = item.trim();
            const pair = processedItem.split("=");
            if (pair.length > 1) {
                const key = pair[0];
                pair.shift();
                parsedCookie[key] = pair.join("=");
            }
        }

        return parsedCookie;
    }

    public static processHeader(header: IncomingHttpHeaders): MapOfString {
        const newHeader: MapOfString = {};

        for (const key of Object.keys(header)) {
            const value = header[key];
            if (value) {
                newHeader[key] = typeof value === "string" ? value : value.join("%%%");
            }
        }

        return newHeader;
    }

    public static processLanguage(
        cookies: MapOfString,
        params: MapOfString,
        headers: IncomingHttpHeaders,
        defaultNameForCookie: string,
        defaultNameForParam: string,
    ): AreaCode {
        const paramsLanguage = params[defaultNameForParam] || "";
        const cookieLanguage = cookies[defaultNameForCookie] || "";
        const acceptLanguage = parseAcceptLanguage(headers["accept-language"] || "");

        const language = paramsLanguage || cookieLanguage || acceptLanguage;

        return language ? parseAreaString(language, true) : AreaCode.unknown;
    }
}
