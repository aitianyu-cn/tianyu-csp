/** @format */

import { NetworkServiceResponseData } from "#interface";

/**
 * default rest fallback loader
 *
 * @returns return fallback data
 */
export default async function (): Promise<NetworkServiceResponseData> {
    const html = TIANYU.import.html("$.default.pages.fallback");
    const result: NetworkServiceResponseData = {
        statusCode: 0,
        headers: { "Content-Type": "text/html" },
        body: html,
    };

    return result;
}
