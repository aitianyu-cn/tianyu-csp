/** @format */

import { NetworkServiceResponseData } from "#interface";

export default async function (): Promise<NetworkServiceResponseData> {
    const result: NetworkServiceResponseData = {
        statusCode: 0,
        headers: {},
        body: undefined,
    };

    return result;
}
