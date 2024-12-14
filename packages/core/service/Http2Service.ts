/** @format */

import { guid } from "@aitianyu.cn/types";
import { IHttpService, RequestType } from "#interface";

export class Http2Service implements IHttpService {
    private _id: string;

    public constructor() {
        this._id = guid();
    }

    public get id(): string {
        return this._id;
    }

    public get type(): RequestType {
        return "http";
    }

    public listen(): void {
        throw new Error("Method not implemented.");
    }
    public close(): void {
        throw new Error("Method not implemented.");
    }
}
