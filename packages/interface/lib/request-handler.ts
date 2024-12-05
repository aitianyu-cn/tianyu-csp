/** @format */

import { AreaCode, MapOfString } from "@aitianyu.cn/types";
import { IService } from "./service";

export interface DefaultRequestItemsMap {
    language?: string;
}

export interface IRequestHandler {
    dispatch(payload: PayloadData): void;
    register(service: IService): void;

    getRequestItem(type: keyof DefaultRequestItemsMap): string;
}

export type RequestType = "http";

export interface PayloadData {
    url: string;
    serviceId: string;
    requestId: string;

    type: RequestType;

    language: AreaCode;
    body: any;
    cookie: MapOfString;
    param: MapOfString;
    headers: MapOfString;
}
