/** @format */

import { AreaCode, MapOfString, MapOfStrings, MapOfType } from "@aitianyu.cn/types";
import { RequestType } from "../fwk-def/contributor/requests";
import { HttpProtocal } from "../service/http-service";

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
    /** Request Host (change to remote host if there is a transmition request) */
    host: string;
    /** Request Url (change to rewritten url if there is a transmition request) */
    url: string;
    /** Network request type */
    type: RequestType;
    /** Request language */
    language: AreaCode;
    /** session id */
    session: string;
    /** request body */
    body: any;
    /** request based http protocol */
    protocol: HttpProtocal;

    /**
     * to set a response code
     *
     * @param code new response code
     */
    setResponseCode(code: number): void;
    /**
     * get current response code
     *
     * @returns return current code
     */
    getResponseCode(): number;

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
    header(key: string): string | string[];
    /**
     * To get a request params value by key. This field is used in HTTP request.
     *
     * @param key name of params key
     *
     * @returns return the params value
     */
    params(key: string): string | string[];
    /**
     * To get all headers from request.
     *
     * @returns map of headers
     */
    allHeaders(): MapOfType<string | string[] | undefined>;
    /**
     * To get all parameters.
     *
     * @returns map of params
     */
    allParams(): MapOfStrings;
}
