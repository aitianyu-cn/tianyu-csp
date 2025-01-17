/** @format */

import { MapOfString } from "@aitianyu.cn/types";
import { HttpCallMethod } from "./http-client";
import { HttpProtocal } from "../service/http-service";

/** Remote Procedure request payload data */
export interface ProcedureCallPayload {
    /** remote host (contains port) */
    host: string;
    /** remote call url */
    url: string;
    /** connection http protocol */
    protocol: HttpProtocal;
    /** http require method */
    method: HttpCallMethod;
    /** require url searches */
    param?: MapOfString;
    /** http require header */
    header?: MapOfString;
    /** http require cookies */
    cookies?: MapOfString;
    /** http request data (only used for "POST" method) */
    body?: any;
}
