/** @format */

import { MapOfString } from "@aitianyu.cn/types";
import { HttpCallMethod } from "./http-client";

export interface PrecdureCallPayload {
    method: HttpCallMethod;
    url: string;
    param: MapOfString;
    header: MapOfString;
    cookies: MapOfString;
    body: any;
}
