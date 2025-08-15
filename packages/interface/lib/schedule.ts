/** @format */

import { AreaCode } from "@aitianyu.cn/types";
import { RequestPayloadData } from "../fwk-def/contributor/requests";

export interface ScheduleJobPayload {
    id: string;
    name: string;
    payload: any;

    userId: string;
    language: AreaCode;

    req: RequestPayloadData;
}

export interface SchedultJobExecuteParam {
    id: string;
    name: string;
    payload: any;
}
