/** @format */

import { AreaCode } from "@aitianyu.cn/types";
import { RequestType } from "../fwk-def/contributor/requests";

/** CSP Request API for global */
export interface IServerRequest {
    /**
     * Request Unified Id
     *
     * request id is used for response handling
     */
    id: string;
    /** Request Service Version */
    version: string;
    /** Request Url */
    url: string;
    /** Network request type */
    type: RequestType;
    /** Request language */
    language: AreaCode;

    /**
     * To get a cookie value by key. This field is used in HTTP request.
     *
     * @param key name of cookie item
     *
     * @returns return the cookie value
     */
    cookie(key: string): string;
    /**
     * To get a request header value by key. This field is used in HTTP request.
     *
     * @param key name of header item
     *
     * @returns return the header value
     */
    header(key: string): string;
    /**
     * To get a request params value by key. This field is used in HTTP request.
     *
     * @param key name of params key
     *
     * @returns return the params value
     */
    params(key: string): string;
}
