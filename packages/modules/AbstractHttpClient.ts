/** @format */

import { HttpCallMethod, IHttpClient } from "#interface";
import { MapOfString } from "@aitianyu.cn/types";

export abstract class AbstractHttpClient implements IHttpClient {
    protected locate: string;
    protected port: number;
    protected path: string;
    protected method: HttpCallMethod;
    protected body: any;

    protected param: MapOfString;
    protected header: MapOfString;
    protected cookies: MapOfString;

    protected result: string;

    /**
     * Create a Http Client
     *
     * @param locate Remote host
     * @param path connection path
     * @param method request method
     */
    public constructor(locate: string, path: string, method: HttpCallMethod) {
        this.locate = locate;
        this.port = 80;
        this.path = path;
        this.method = method;

        this.param = {};
        this.header = {};
        this.cookies = {};
        this.body = null;

        this.result = "";
    }

    public get raw(): string {
        return String(this.result);
    }

    public get response(): any {
        try {
            return JSON.parse(this.result);
        } catch {
            return null;
        }
    }

    public setParameter(param: MapOfString): void {
        this.param = { ...this.param, ...param };
    }

    public setHeader(header: MapOfString): void {
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

    public abstract send(): Promise<void>;
}
