/** @format */

import { AreaCode, MapOfString } from "@aitianyu.cn/types";
import { NetworkServiceResponseData } from "./service";

/**
 * Request items target type
 *
 * @example
 * cookie   // indicates the item name is for cookie
 * search   // indicates the item name is for url parameter search
 */
export type DefaultRequestItemTargetType = "cookie" | "search";

/**
 * Default Requestion Item name map
 *
 * To map some default cookie and search items
 * (like language in cookie, uses LANGUAGE or LANG as key or other customized name)
 */
export interface DefaultRequestItemsMap {
    /** key of language in cookie and search */

    /** default language define */
    language?: string | { [key in DefaultRequestItemTargetType]: string };
    /** default session define */
    session?: string | { [key in DefaultRequestItemTargetType]: string };
    /** default disable cache define */
    disableCache?: string;
}

/** Supported Network Request Service Type */
export type RequestType = "http";

/** Network Request Payload Data */
export interface RequestPayloadData {
    /** Network URL */
    url: string;
    /** Network service id */
    serviceId: string;
    /** Network request id */
    requestId: string;
    /** Given Error Trace id */
    traceId?: string;
    /** Network session id */
    sessionId: string;
    /** to disable request cache for current request */
    disableCache: boolean;

    /** Network request type */
    type: RequestType;

    /** Request language */
    language: AreaCode;
    /** Request data */
    body: any;
    /** Cookies */
    cookie: MapOfString;
    /** Search Parameters */
    param: MapOfString;
    /** Headers */
    headers: MapOfString;
}

/** Request response payload data */
export interface ResponsePayloadData extends NetworkServiceResponseData {
    /** Network service id */
    serviceId: string;
    /** Network request id */
    requestId: string;
}
