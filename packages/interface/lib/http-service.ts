/** @format */

import { IncomingMessage, ServerResponse } from "http";
import { IService } from "./service";

/** Http Query Response Callback */
export type HttpCallback = (req: IncomingMessage, res: ServerResponse) => void;

export interface HttpServiceOption {
    host: string;
    port: number;
}

export interface IHttpService extends IService {
    listen(): void;
}

export const HTTP_STATUS_CODE = {
    METHOD_NOT_ALLOWED: 405,
};
