/** @format */

import { RequestPayloadData } from "../fwk-def/contributor/requests";

export interface ScheduleJobPayload {
    id: string;
    name: string;
    payload: any;

    req: RequestPayloadData;
}

export interface SchedultJobExecuteParam {
    id: string;
    name: string;
    payload: any;
}
