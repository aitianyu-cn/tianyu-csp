/** @format */

import { Json } from "#base/object/Json";
import { HttpCallMethod, IHttpClient } from "#interface";
import { MapOfString, MapOfStrings, MapOfType } from "@aitianyu.cn/types";
import { EventEmitter, Stream } from "stream";
import { createGunzip } from "zlib";

export abstract class AbstractHttpClient implements IHttpClient {
    protected locate: string;
    protected port?: number;
    protected path: string;
    protected method: HttpCallMethod;
    protected body: any;

    protected param: MapOfStrings;
    protected header: MapOfType<string | string[] | undefined>;
    protected cookies: MapOfString;

    protected result: string;
    protected responseHeaders: MapOfType<string | string[] | undefined>;

    /**
     * Create a Http Client
     *
     * @param locate Remote host
     * @param path connection path
     * @param method request method
     */
    public constructor(locate: string, path: string, method: HttpCallMethod) {
        this.locate = locate;
        this.path = path;
        this.method = method;

        this.param = {};
        this.header = {};
        this.cookies = {};
        this.body = null;

        this.result = "";
        this.responseHeaders = {};
    }

    public get raw(): string {
        return String(this.result);
    }

    public get response(): any {
        return Json.parseSafe(this.result);
    }

    public setParameter(param: MapOfStrings): void {
        this.param = { ...this.param, ...param };
    }

    public setHeader(header: MapOfType<string | string[] | undefined>): void {
        this.header = { ...this.header, ...header };
    }

    public setCookie(cookies: MapOfString): void {
        this.cookies = { ...this.cookies, ...cookies };
    }

    public setPort(port: number): void {
        this.port = port;
    }

    public setBody(body: any): void {
        this.body = body;
    }

    public allHeaders(): MapOfType<string | string[] | undefined> {
        return this.responseHeaders;
    }

    public abstract send(): Promise<void>;

    protected decodeStream(input: Stream, header: MapOfType<string | readonly string[] | undefined>): EventEmitter {
        if (header["content-encoding"] === "gzip") {
            const gzip = createGunzip();
            input.pipe(gzip);
            return gzip;
        }

        return input;
    }
}
