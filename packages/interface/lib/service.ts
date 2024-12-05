/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { RequestType } from "./request-handler";

export interface ServiceResolveData {
    statusCode: number;
    headers: MapOfType<number | string | ReadonlyArray<string>>;

    body: any;
}

export interface IService {
    id: string;
    type: RequestType;

    close(): void;
    resolve(requestId: string, data: ServiceResolveData): void;
}
