/** @format */

import { MapOfString } from "@aitianyu.cn/types";

/**
 * Type of Http request method type
 *
 * @field GET
 * @field POST
 */
export type HttpCallMethod = "GET" | "POST";

/** Interface of Http Request Client */
export interface IHttpClient {
    /** To get a http response raw string */
    raw: string;
    /** To get a http response as object, null value will be returned if the value is not a valid json object */
    response: any;

    /**
     * To set a url search parameters map
     *
     * @param param parameters map
     */
    setParameter(param: MapOfString): void;
    /**
     * To set a request headers map
     *
     * @param param headers map
     */
    setHeader(param: MapOfString): void;
    /**
     * To set a request cookies map
     *
     * @param param cookies map
     */
    setCookie(param: MapOfString): void;
    /**
     * To set request body
     *
     * @param param request body, recommends is object type
     */
    setBody(body: any): void;
    /**
     * To set the request service port
     *
     * @param port service port
     */
    setPort(port: number): void;

    /** To send the request and wait for the response */
    send(): Promise<void>;
}
