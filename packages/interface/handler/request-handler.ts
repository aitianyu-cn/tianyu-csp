/** @format */

import { AreaCode, MapOfString } from "@aitianyu.cn/types";
import { INetworkService } from "../service/service";

/**
 * Default Requestion Item name map
 *
 * To map some default cookie and search items
 * (like language in cookie, uses LANGUAGE or LANG as key or other customized name)
 */
export interface DefaultRequestItemsMap {
    /** key of language in cookie and search */
    language?: string | { [key in DefaultRequestItemTargetType]: string };
}

export type DefaultRequestItemTargetType = "cookie" | "search";

/** Requests handler API */
export interface IRequestHandler {
    /**
     * To dispatch a request
     *
     * @param payload the request unstructed payload
     */
    dispatch(payload: PayloadData): void;
    /**
     * To register a network service
     *
     * @param service the service instance
     */
    register(service: INetworkService): void;
    /**
     * To unregister a network service
     *
     * @param serviceId the service instance id
     */
    unregister(serviceId: string): void;

    /**
     * To get the request search or cookie item name
     *
     * @param name the name of item
     * @param type the type of item target, like cookie or search
     * @returns return the mapped item name
     */
    getRequestItem(name: keyof DefaultRequestItemsMap, type: DefaultRequestItemTargetType): string;
}

/** Supported Network Request Service Type */
export type RequestType = "http";

/** Network Request Payload Data */
export interface PayloadData {
    /** Network URL */
    url: string;
    /** Network service id */
    serviceId: string;
    /** Network request id */
    requestId: string;
    /** Given Error Trace id */
    traceId?: string;

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
