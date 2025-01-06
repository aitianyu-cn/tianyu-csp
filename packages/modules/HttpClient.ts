/** @format */

import { HTTP_STATUS_CODE, HttpCallMethod } from "#interface";
import { MapOfString } from "@aitianyu.cn/types";
import * as Http from "http";
import { PROJECT_ENVIRONMENT_MODE } from "packages/Common";

export class HttpClient {
    private url: string;
    private path: string;
    private method: HttpCallMethod;

    private param: MapOfString;
    private header: MapOfString;
    private cookies: MapOfString;
    private body: any;

    private result: any;

    public constructor(url: string, path: string, method: HttpCallMethod) {
        this.url = url;
        this.path = path;
        this.method = method;

        this.param = {};
        this.header = {};
        this.cookies = {};
        this.body = null;

        this.result = undefined;
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

    public setBody(body: any): void {
        this.body = body;
    }

    public async send(): Promise<void> {
        const header = this.header;
        const cookieStr = this.handleCookie();
        header["cookie"] = header["cookie"] ? [header["cookie"], cookieStr].join(";") : cookieStr;

        const option: Http.RequestOptions = {
            method: this.method,
            headers: header,
            path: `${this.path || "/"}${this.handleParam()}`,
        };
        if (PROJECT_ENVIRONMENT_MODE !== "development") {
            option["protocol"] = "https:";
            option["port"] = 443;
        }

        return new Promise<void>((resolve, reject) => {
            const client = Http.request(
                this.url,
                {
                    method: this.method,
                    headers: this.header,
                },
                (res) => {
                    if (res.statusCode !== HTTP_STATUS_CODE.OK) {
                        reject(res.statusCode);
                    }

                    res.on("data", (chunk) => {
                        this.result += chunk;
                    });
                    res.on("end", () => {
                        resolve();
                    });
                },
            );
            client.on("error", reject);

            if (this.method === "POST") {
                client.write(JSON.stringify(this.body || ""));
            }

            client.end();
        });
    }

    private handleCookie(): string {
        const cookiePair: string[] = [];
        for (const key of Object.keys(this.cookies)) {
            this.cookies[key] && cookiePair.push(`${key}=${this.cookies[key]}`);
        }
        return cookiePair.join(";");
    }

    private handleParam(): string {
        const paramPair: string[] = [];
        for (const key of Object.keys(this.param)) {
            this.param[key] && paramPair.push(`${key}=${this.param[key]}`);
        }
        return paramPair.length ? `?${paramPair.join("&")}` : "";
    }
}
