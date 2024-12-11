/** @format */

import { DEFAULT_HTTP_HOST, DEFAULT_HTTP_PORT, SERVICE_ERROR_CODES } from "#core/Constant";
import {
    HTTP_STATUS_CODE,
    HttpServiceOption,
    IHttpService,
    RequestPayloadData,
    RequestType,
    NetworkServiceResponseData,
    REQUEST_HANDLER_MODULE_ID,
} from "#interface";
import { HttpHelper } from "#utils/HttpHelper";
import { TraceHelper } from "#utils/TraceHelper";
import { guid, MapOfString } from "@aitianyu.cn/types";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";

export class HttpService implements IHttpService {
    private _id: string;
    private _host: string;
    private _port: number;

    private _server: Server;

    public constructor(options?: HttpServiceOption) {
        this._id = guid();
        this._host = options?.host || DEFAULT_HTTP_HOST;
        this._port = options?.port || DEFAULT_HTTP_PORT;

        this._server = createServer((req: IncomingMessage, res: ServerResponse) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");

            switch (req.method) {
                case "GET":
                    this.onGet(req, res);
                    break;
                case "POST":
                    this.onPost(req, res);
                    break;
                default:
                    this.onInvalidCall(req, res);
                    break;
            }
        });
    }

    public get id(): string {
        return this._id;
    }
    public get type(): RequestType {
        return "http";
    }
    public listen(): void {
        this._server.listen(this._port, this._host);
    }
    public close(): void {
        this._server.close();
    }

    private onGet(req: IncomingMessage, res: ServerResponse): void {
        const param = HttpHelper.processParameters(req.url || "");
        const cookie = HttpHelper.processCookie(req.headers.cookie || "");
        const headers = HttpHelper.processHeader(req.headers);
        const itemsGetter = TIANYU.fwk.contributor.findModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
        const language = HttpHelper.processLanguage(
            cookie,
            param,
            req.headers,
            itemsGetter?.({ name: "language", type: "cookie" }),
            itemsGetter?.({ name: "language", type: "search" }),
        );
        const requestId = guid();

        const payload: RequestPayloadData = {
            param,
            cookie,
            headers,
            language,
            requestId,

            url: req.url || "",
            serviceId: this.id,
            type: "http",
            body: null,
            traceId: TraceHelper.generateTraceId(),
        };

        this._handleDispatch(payload, headers, req, res);
    }
    private onPost(req: IncomingMessage, res: ServerResponse): void {
        let data: string = "";

        req.on("data", (chunk: any) => {
            data += chunk;
        });

        req.on("end", () => {
            let body: any = null;
            try {
                body = JSON.parse(decodeURI(data));
            } catch {}

            const param: MapOfString = HttpHelper.processParameters(req.url || "");
            const cookie: MapOfString = HttpHelper.processCookie(req.headers.cookie || "");
            const headers = HttpHelper.processHeader(req.headers);

            const itemsGetter = TIANYU.fwk.contributor.findModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
            const language = HttpHelper.processLanguage(
                cookie,
                param,
                req.headers,
                itemsGetter?.({ name: "language", type: "cookie" }),
                itemsGetter?.({ name: "language", type: "search" }),
            );
            const requestId = guid();

            const payload: RequestPayloadData = {
                body,
                param,
                cookie,
                headers,
                language,
                requestId,

                url: req.url || "",
                serviceId: this.id,
                type: "http",
                traceId: TraceHelper.generateTraceId(),
            };
            this._handleDispatch(payload, headers, req, res);
        });
    }
    private _handleDispatch(payload: RequestPayloadData, headers: MapOfString, req: IncomingMessage, res: ServerResponse): void {
        setTimeout(() => {
            const dispatcher = TIANYU.fwk.contributor.findModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            if (dispatcher) {
                dispatcher(payload).then(
                    (data) => this.onResponse(res, data),
                    (error) => {
                        const responseData: NetworkServiceResponseData = {
                            statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
                            headers,
                            body: {
                                error: [
                                    {
                                        code: SERVICE_ERROR_CODES.INTERNAL_ERROR,
                                        message: error?.message || "Technical error occurs when processing request.",
                                    },
                                ],
                            },
                        };
                        this.onResponse(res, responseData);
                    },
                );
            } else {
                this.onDispatcherInvalid(req, res);
            }
        }, 0);
    }
    private onInvalidCall(_req: IncomingMessage, res: ServerResponse): void {
        setTimeout(() => {
            const resBody = {
                error: [
                    {
                        code: SERVICE_ERROR_CODES.REQUEST_METHOD_NOT_SUPPORT,
                        message: "Request method handler is not found, please ensure your http request uses correct method.",
                    },
                ],
            };
            res.statusCode = HTTP_STATUS_CODE.METHOD_NOT_ALLOWED;
            res.end(JSON.stringify(resBody));
        }, 0);
    }
    private onDispatcherInvalid(_req: IncomingMessage, res: ServerResponse): void {
        setTimeout(() => {
            const resBody = {
                error: [
                    {
                        code: SERVICE_ERROR_CODES.SERVICE_HANDLER_LOST,
                        message: "Request processor could not be found, please contact admin to check.",
                    },
                ],
            };
            res.statusCode = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR;
            res.end(JSON.stringify(resBody));
        }, 0);
    }
    private onResponse(response: ServerResponse, data: NetworkServiceResponseData): void {
        response.statusCode = data.statusCode;
        for (const key of Object.keys(data.headers)) {
            response.setHeader(key, data.headers[key]);
        }

        response.end(JSON.stringify(data.body));
    }
}
