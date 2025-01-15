/** @format */

import { MapOfString } from "@aitianyu.cn/types";
import { ClientSessionRequestOptions } from "http2";

/**
 * Type of Http request method type
 *
 * @field GET
 * @field POST
 */
export type HttpCallMethod = "GET" | "POST";

/**
 * Query definition of Http/2.0
 *
 * Since multi-request is supported in one http/2.0 connection, this is the definition of each Http/2.0 request.
 */
export interface Http2Query {
    /**
     * request path
     *
     * Http/2.0 Client default path will be applied if this item is undefined or empty
     */
    path?: string;
    /**
     * request method
     *
     * Http/2.0 Client default method will be applied if this item is undefined
     */
    method?: HttpCallMethod;
    /**
     * request body
     *
     * Used for "POST" request only.
     */
    body?: any;
    /**
     * request param of path
     *
     * path search will uses param which is query param combined with Http/2.0 client default param
     */
    param?: MapOfString;
    /**
     * request cookie of request
     *
     * request cookie will uses cookie which is query cookie combined with Http/2.0 client default cookie
     */
    cookie?: MapOfString;
    /**
     * request header of request
     *
     * request header will uses param which is query header combined with Http/2.0 client default header
     */
    header?: MapOfString;
    /** Http/2.0 request option */
    option?: ClientSessionRequestOptions;
}

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
