/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { RequestType } from "./request-handler";

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
    headers: MapOfType<number | string | ReadonlyArray<string>>;

    /** Response Data */
    body: any;
}

/** Interface for Common network Services */
export interface INetworkService {
    /** service id */
    id: string;
    /** network service request type */
    type: RequestType;

    /** To close current service */
    close(): void;
    /**
     * To receive a data and to resolve the corresponding network request.
     *
     * @param requestId network request id
     * @param data network response data
     */
    resolve(requestId: string, data: NetworkServiceResponseData): void;
}
