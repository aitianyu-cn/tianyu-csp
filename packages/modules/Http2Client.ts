/** @format */

import http2 from "http2";
import { Http2Query, HttpCallMethod } from "#interface";
import { AbstractHttpClient } from "./AbstractHttpClient";
import { ErrorHelper, HttpHelper } from "#utils";
import { MapOfString, MapOfType } from "@aitianyu.cn/types";
import { SERVICE_ERROR_CODES } from "#core/Constant";

export class Http2Client extends AbstractHttpClient {
    private _options?: http2.SecureClientSessionOptions;
    private querys: { query: Http2Query; result: string; status: number; headers: MapOfType<string | string[] | undefined> }[];

    /**
     * Create a Http/2.0 Client
     *
     * @param locate Remote host
     * @param path connection path
     * @param method request method
     */
    public constructor(locate: string, path: string, method: HttpCallMethod) {
        super(locate, path, method);

        this.port = 0;
        this.querys = [];
    }

    /** Get count of the queries in the connection */
    public get count(): number {
        return this.querys.length;
    }

    public override get raw(): string {
        return this.count === 0 ? "" : this.querys[0].result;
    }

    public override get response(): any {
        return this.count === 0 ? null : this.getResponse(0);
    }

    /**
     * To get a http response status code
     *
     * @returns return the status code, -1 will be returned if the request does not finished or not exist, or has fatal error.
     */
    public get status(): number {
        return this.count === 0 ? -1 : this.querys[0].status;
    }

    /** Get all query responses raw data */
    public get multiRaws(): string[] {
        return this.querys.map((value) => value.result);
    }

    /** Get all query responses as object */
    public get multiResponses(): any[] {
        return this.querys.map((_, index) => this.getResponse(index));
    }

    /** Get all query responses status code */
    public get multiStatus(): number[] {
        return this.querys.map((value) => value.status);
    }

    public override allHeaders(): MapOfType<string | string[] | undefined> {
        return this.count === 0 ? {} : this.querys[0].headers;
    }

    /**
     * Get a query response raw data from given index.
     *
     * @param index index of query
     * @returns return the query response raw data string or null value will be returned if not found
     */
    public getRaw(index: number): string | null {
        return index >= 0 && index < this.count ? this.querys[index].result : null;
    }

    /**
     * Get a query response parsed object data from given index.
     *
     * @param index index of query
     * @returns return the query response data or null value will be returned if not found
     */
    public getResponse(index: number): any {
        if (index < 0 || index >= this.count) {
            return null;
        }

        try {
            return JSON.parse(this.querys[index].result);
        } catch {
            return null;
        }
    }

    /**
     * Get a query response status code from given index.
     *
     * @param index index of query
     * @returns return the query response status code or null value will be returned if not found
     */
    public getStatus(index: number): number {
        if (index < 0 || index >= this.count) {
            return -1;
        }

        return this.querys[index].status;
    }

    /**
     * Get a query definition from given index.
     *
     * @param index index of query
     * @returns return the query definition or null value will be returned if not found
     */
    public getQuery(index: number): Http2Query | null {
        if (index < 0 || index >= this.count) {
            return null;
        }

        return this.querys[index].query;
    }

    public getHeader(index: number): MapOfType<string | string[] | undefined> {
        if (index < 0 || index >= this.count) {
            return {};
        }

        return this.querys[index].headers;
    }

    /**
     * To set the Http/2.0 connection option
     *
     * @param options connection option
     * @param overwritten true: to clean previous option setting and set the new option, false: to append new option to the preivous option setting
     */
    public setOption(options?: http2.SecureClientSessionOptions, overwritten?: boolean): void {
        this._options =
            this._options && !overwritten ? { ...(this._options || /* istanbul ignore next */ {}), ...(options || {}) } : options;
    }

    /**
     * To add a request query to the queue.
     *
     * Since multi-request is supported in one http/2.0 connection, add a request query into request waiting queue.
     *
     * If no query added, the default query which based on default set path, method and body will be used.
     *
     * @param req query definition
     * @returns return the index of the new added query, the index can be used to search the result
     */
    public query(req: Http2Query): number {
        const newCount = this.querys.push({ query: req, result: "", status: -1, headers: {} });
        return newCount - 1;
    }

    public async send(): Promise<void> {
        if (!this.count) {
            this.querys.push({ query: { body: this.body }, result: "", status: -1, headers: {} });
        }

        const port = this.port <= 0 ? /* istanbul ignore next */ "" : `:${this.port}`;
        const client = http2.connect(`https://${this.locate}${port}`, this._options);
        const requestsPromise: Promise<void>[] = [];
        for (let index = 0; index < this.count; ++index) {
            requestsPromise.push(this.transfer(index, client));
        }
        return Promise.all(requestsPromise)
            .then(() => Promise.resolve())
            .finally(() => {
                client.close();
            });
    }

    private async transfer(index: number, client: http2.ClientHttp2Session): Promise<void> {
        const query = this.getQuery(index) as Http2Query;
        const headers = this.processHeader(query);
        const method = headers[":method"];

        return new Promise<void>((resolve, reject) => {
            try {
                const req = client.request(headers, query.option);
                req.on("response", (header) => {
                    const status = Number(header[":status"]);
                    this.querys[index].status = Number.isNaN(status) ? /* istanbul ignore next */ -1 : status;
                    this.querys[index].headers = header;

                    req.on("data", (chunk) => {
                        this.querys[index].result += chunk;
                    });
                    req.on("end", () => {
                        resolve();
                    });
                });
                req.on(
                    "error",
                    /* istanbul ignore next */ (error) => {
                        reject(
                            ErrorHelper.getError(
                                SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR,
                                `request data from ${headers[":path"]} failed`,
                                String(error),
                            ),
                        );
                    },
                );

                if (query.body && (method as HttpCallMethod) === "POST") {
                    req.write(JSON.stringify(query.body));
                }

                req.end();
            } catch (e) /* istanbul ignore next */ {
                reject(
                    ErrorHelper.getError(
                        SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR,
                        `request data from ${headers[":path"]} failed`,
                        String(e),
                    ),
                );
            }
        });
    }

    private processHeader(query: Http2Query): MapOfString {
        const headers = { ...this.header, ...(query.header || {}) };

        const cookie = HttpHelper.stringifyCookie({ ...this.cookies, ...(query.cookie || {}) });
        headers["cookie"] = `${headers["cookie"] || ""}${cookie}`;

        const path = `${query.path || this.path}${HttpHelper.stringifyParam({ ...this.param, ...(query.param || {}) })}`;
        headers[":path"] = path;

        headers[":method"] = query.method || this.method;

        return headers;
    }
}
