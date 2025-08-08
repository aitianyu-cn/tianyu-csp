/** @format */

import { MapOfType } from "@aitianyu.cn/types";

/** Network Serivce Response Data */
export interface NetworkServiceResponseData {
    /**
     * Network Status Code
     *
     * For HTTP response: same as HTTP status
     * For Other response: to be the custom code
     */
    statusCode: number;
    /**
     * Network response headers
     *
     * This field is used in HTTP only
     */
    headers: MapOfType<number | string | readonly string[] | string[] | undefined>;

    /** Response Data */
    body: any;

    binary?: boolean;
}
