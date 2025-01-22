/** @format */

import { IncomingMessage, ServerResponse } from "http";
import { INetworkService } from "./service";
import { CallbackActionT, MapOfString, MapOfType } from "@aitianyu.cn/types";
import { ImportPackage } from "../api/importer";
import { PathEntry } from "../handler/rest-handler";
import { SecureContextOptions, TlsOptions } from "tls";
import { NetworkServiceResponseData } from "../fwk-def/contributor/service";
import { RequestPayloadData } from "../fwk-def/contributor/requests";
import { HttpCallMethod } from "../modules/http-client";

/** Http Query Response Callback */
export type HttpCallback = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * Http Supported Protocol in csp
 *
 * @http Http1.0 connection without secure
 * @https Http1.0 connection based on secure
 * @http2 Http2.0 connection based on secure
 */
export type HttpProtocal = "http" | "https" | "http2";

/** Http Server Cache Setting */
export interface HttpServerCacheSetting {
    /**
     * Cache type
     *
     * @local use local cache
     * @database use given cache callbacks to save, read and controlle the caches.
     */
    type: "local" | "database";
    /**
     * Milliseconds time of an interval runner to call the cycle to clean cached items which out of date
     */
    watch?: number;

    /** To do cache cycle to clean items which out of date */
    cycle?(): void;
    /** To clean all caches */
    clean?(): void;
    /**
     * To save a cache
     *
     * @param response new response data
     * @param payload request payload
     * @param option http request option
     */
    writer?(response: NetworkServiceResponseData, payload: RequestPayloadData, option?: HttpRequestCacheOption): void;
    /**
     * To get a response from cache
     *
     * @param payload request payload
     * @param option http request option
     *
     * @returns return a response data, null value will be returned if cache not valid
     */
    reader?(payload: RequestPayloadData, option?: HttpRequestCacheOption): Promise<NetworkServiceResponseData | null>;
}

/** Htto Service Option */
export interface HttpServiceOption {
    /** Host to bind */
    host: string;
    /** Port to bind */
    port: number;
    /**
     * Http service to support advanced rest
     *
     * @undefined enable advanced rest and support parameter and wildcard character
     * @true enable advanced rest and support parameter and wildcard character
     * @falue use normal rest and only support full url matching
     */
    advanceRest?: boolean;
    /**
     * Http service to support fallback when rest is not matched
     *
     * @true enable fallback
     * @undefined disable fallback, HTTP 404 will be returned
     * @falue disable fallback, HTTP 404 will be returned
     */
    enablefallback?: boolean;

    /** Customized Rest map, if no rest map is given, default global defined rest map will be used */
    rest?: MapOfType<HttpRestItem>;
    /** Customized Rest fallback, if no fallback is given, default global defined fallback will be used */
    fallback?: PathEntry;

    /**
     * Customized Http Cache setting
     *
     * @undefined if the cache setting is not given, the http server will not enable the response cache
     */
    cache?: HttpServerCacheSetting;
}

/** Https Option */
export type HttpSecurityOption = TlsOptions & {
    /** allow http 1.0 */
    allowHTTP1?: boolean | undefined;
    /** request origins */
    origins?: string[] | undefined;
};

/** Http2.0 Service Option */
export type Http2ServiceOption = HttpServiceOption & HttpSecurityOption;

/**
 * The type of how to cache the request response data for quick response
 *
 * @warnning full type should not to be used for browser due to the header and cookies are not stable
 *
 * @field
 * @url indicates the cache is mapped to the url only, return the cached data if the url is matched
 * @full indicates the cache should check url, cookie, header and method
 * @custom indicates the cache should check the custom specified items (based on url checking, if url is different, the cache will not valid)
 */
export type HttpRequestCacheType = "url" | "full" | "custom";

/** Http Request Option of cache */
export interface HttpRequestCacheOption {
    /** type of how to cache the request response data */
    type: HttpRequestCacheType;
    /** indicates whether the cache should bind a session */
    session?: boolean;
    /** specified cookie items to used for cache checking */
    cookie?: string[];
    /** specified header items to used for cache checking */
    header?: string[];
    /** specified parameters items to used for cache checking */
    params?: string[];
    /** cache valid timeout, number of millisecond */
    timeout?: number;
}

/** Http request remote transmition rest option */
export interface HttpRequestProxyOption {
    /**
     * Remote transmition specified http protocal
     *
     * @default http2
     */
    protocol?: HttpProtocal;
    /**
     * Remote transmition url rewrite map
     *
     * @example
     * rewrite: {
     *      "/remote": "",
     *      "/remote/test/code": "/test-code",
     *      "/remote/debug": ""
     * };
     * remote: "template.org";
     *
     * source-url: "https://localhost/remote/test/code"
     * target-url: "https://template.org/test-code"
     *
     * source-url: "https://localhost/remote/release/code"
     * target-url: "https://template.org/release/code"
     *
     * source-url: "https://localhost/remote/debug/code"
     * target-url: "https://template.org/code"
     */
    rewrite?: MapOfString;
    /** Request relocated host */
    host: string;
}

/** Http request rest item */
export interface HttpRestItem {
    /** Http Request handler for all methods */
    handler?: ImportPackage;
    /** Define different Http Request handler for each method type */
    handlers?: { [key in HttpCallMethod]?: ImportPackage };
    /** Http Request response cache option */
    cache?: HttpRequestCacheOption;
    /** Http Proxy setting */
    proxy?: HttpRequestProxyOption;
}

/** Http Service API */
export interface IHttpService<Event extends {}> extends INetworkService, IHttpEventHandler<Event> {
    /**
     * To start http listening ont the binding host and port
     *
     * @param callback callback function when server is started
     */
    listen(callback?: () => void): void;
}

/**
 * Http Service Event Handler API to register and response an event
 *
 * @template Event a template event describe map
 */
export interface IHttpEventHandler<Event extends {}> {
    /**
     * To invoke an event with value
     *
     * @param event event id
     * @param value event value
     */
    emit<EK extends keyof Event, EV = EK extends keyof Event ? Event[EK] : undefined>(event: EK, value: EV): void;

    /**
     * To watch an event occurs
     *
     * @param event watched event id
     * @param watcher watcher name
     * @param callback callback function if the event is triggered
     */
    watch<EK extends keyof Event, EV = EK extends keyof Event ? Event[EK] : undefined>(
        event: EK,
        watcher: string,
        callback: CallbackActionT<EV>,
    ): void;

    /**
     * To stop watching an event
     *
     * @param event event id
     * @param watcher watcher name
     */
    unwatch<EK extends keyof Event>(event: EK, watcher: string): void;
}

export interface IHttp2Events {
    "authorization-changed": SecureContextOptions;
}

/** Http Status Code */
export const HTTP_STATUS_CODE = {
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    EARLY_HINTS: 103,

    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 303,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207,
    ALREADY_REPORTED: 208,
    IMUSED: 226,

    AMBIGUOUS: 300,
    MOVED_PERMANENTLY: 301,
    REDIRECT_FOUND: 302,
    REDIRECT_METHOD: 303,
    NOT_MODIFIED: 304,
    USE_PROXY: 305,
    UNUSED: 306,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    REQUEST_ENTITY_TOO_LARGE: 413,
    REQUEST_URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    MIS_DIRECTED_REQUEST: 421,
    UNPROCESSABLE_CONTENT: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,

    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511,
};
