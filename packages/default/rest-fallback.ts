/** @format */

import { NetworkServiceResponseData } from "#interface";

export default async function (): Promise<NetworkServiceResponseData> {
    const html = TIANYU.import.html("$.default.pages.fallback");
    const result: NetworkServiceResponseData = {
        statusCode: 0,
        headers: { "Content-Type": "text/html" },
        body: html,
    };

    return result;
}
