/** @format */

import { HTTP_STATUS_CODE, HttpProtocal, IServerRequest, RequestPayloadData, RequestType } from "#interface";
import { AreaCode, MapOfString } from "@aitianyu.cn/types";
import { PROJECT_DEFAULT_LANGUAGE, PROJECT_NAME, PROJECT_VERSION } from "../../Common";

const HTTP_PROTOCOL_VERSION: { [key in HttpProtocal]: string } = {
    http: "1.1",
    https: "1.1",
    http2: "2.0",
};

/**
 * CSP Generic Request Manager for global definition
 *
 * This is only used in job worker thread
 */
export class GlobalRequestManager implements IServerRequest {
    public get id(): string {
        return PROJECT_NAME;
    }
    public get version(): string {
        return PROJECT_VERSION;
    }
    public get host(): string {
        return "";
    }
    public get url(): string {
        return "/";
    }
    public get type(): RequestType {
        return "http";
    }
    public get language(): AreaCode {
        return PROJECT_DEFAULT_LANGUAGE;
    }
    public get session(): string {
        return "";
    }
    public get body(): any {
        return null;
    }
    public setResponseCode(_code: number): void {}
    public getResponseCode(): number {
        return HTTP_STATUS_CODE.OK;
    }
    public cookie(_key: string): string {
        return "";
    }
    public header(_key: string): string {
        return "";
    }
    public params(_key: string): string {
        return "";
    }
}

/**
 * CSP System Request Manager for global definition
 *
 * This is only used in main thread.
 */
export class GenericRequestManager implements IServerRequest {
    private _id: string;
    private _url: string;
    private _host: string;
    private _type: RequestType;
    private _version: HttpProtocal;
    private _language: AreaCode;
    private _session: string;

    private _body: any;

    private _cookie: MapOfString;
    private _headers: MapOfString;
    private _params: MapOfString;

    private _responseCode: number;

    public constructor(req: RequestPayloadData) {
        this._id = req.requestId;
        this._url = req.url;
        this._host = req.host;
        this._type = req.type;
        this._version = req.version;
        this._language = req.language;
        this._session = req.sessionId;

        this._body = req.body;

        this._cookie = req.cookie;
        this._headers = req.headers;
        this._params = req.param;

        this._responseCode = HTTP_STATUS_CODE.OK;
    }

    public setResponseCode(code: number): void {
        this._responseCode = code;
    }
    public getResponseCode(): number {
        return this._responseCode;
    }

    public get id(): string {
        return this._id;
    }
    public get version(): string {
        return HTTP_PROTOCOL_VERSION[this._version];
    }
    public get host(): string {
        return this._host;
    }
    public get url(): string {
        return this._url;
    }
    public get type(): RequestType {
        return this._type;
    }
    public get language(): AreaCode {
        return this._language;
    }
    public get session(): string {
        return this._session;
    }
    public get body(): any {
        return this._body;
    }
    public cookie(key: string): string {
        return this._cookie[key] || "";
    }
    public header(key: string): string {
        return this._headers[key] || "";
    }
    public params(key: string): string {
        return this._params[key] || "";
    }
}
