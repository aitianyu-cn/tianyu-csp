/** @format */

import { DEFAULT_HTTP_HOST, DEFAULT_HTTP_PORT, SERVICE_ERROR_CODES } from "#core/Constant";
import { RestHandler } from "#core/handler/RestHandler";
import { REST } from "#core/handler/RestHandlerConstant";
import { DEFAULT_REST_REQUEST_ITEM_MAP } from "#core/infra/Constant";
import {
    HTTP_STATUS_CODE,
    HttpServiceOption,
    IHttpService,
    RequestPayloadData,
    RequestType,
    NetworkServiceResponseData,
    REQUEST_HANDLER_MODULE_ID,
    ICSPContributorFactorProtocolMap,
} from "#interface";
import { HttpHelper, TraceHelper, RestHelper, ErrorHelper } from "#utils";
import { IContributor } from "@aitianyu.cn/tianyu-app-fwk";
import { guid, MapOfString } from "@aitianyu.cn/types";
import { createServer, IncomingMessage, Server, ServerResponse } from "http";

export class HttpService implements IHttpService {
    private _contributor?: IContributor<ICSPContributorFactorProtocolMap>;

    private _id: string;
    private _host: string;
    private _port: number;

    private _server: Server;
    private _rest: RestHandler | null;

    public constructor(options?: HttpServiceOption, contributor?: IContributor<ICSPContributorFactorProtocolMap>) {
        this._contributor = contributor;

        this._id = guid();
        this._host = options?.host || /* istanbul ignore next */ DEFAULT_HTTP_HOST;
        this._port = options?.port || /* istanbul ignore next */ DEFAULT_HTTP_PORT;

        this._rest =
            options?.advanceRest === undefined || options?.advanceRest ? new RestHandler(REST, options?.enablefallback) : null;
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
    public close(callback?: (err?: Error) => void): void {
        this._server.close(callback);
    }

    private onGet(req: IncomingMessage, res: ServerResponse): void {
        const param = HttpHelper.processParameters(req.url || /* istanbul ignore next */ "");
        const cookie = HttpHelper.processCookie(req.headers.cookie || /* istanbul ignore next */ "");
        const headers = HttpHelper.processHeader(req.headers);
        const itemsGetter = this._contributor?.findModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
        const language = HttpHelper.processLanguage(
            cookie,
            param,
            req.headers,
            itemsGetter?.({ name: "language", type: "cookie" }),
            itemsGetter?.({ name: "language", type: "search" }),
        );
        const sessionIdKey =
            this._contributor?.findModule(
                "request-handler.items-getter",
                REQUEST_HANDLER_MODULE_ID,
            )?.({ name: "session", type: "cookie" }) || DEFAULT_REST_REQUEST_ITEM_MAP.session;
        const sessionId = cookie[sessionIdKey];

        const requestId = guid();

        const payload: RequestPayloadData = {
            param,
            cookie,
            headers,
            language,
            requestId,
            sessionId,

            url: req.url?.split("?")[0] || /* istanbul ignore next */ "",
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

            const param: MapOfString = HttpHelper.processParameters(req.url || /* istanbul ignore next */ "");
            const cookie: MapOfString = HttpHelper.processCookie(req.headers.cookie || /* istanbul ignore next */ "");
            const headers = HttpHelper.processHeader(req.headers);

            const itemsGetter = this._contributor?.findModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
            const language = HttpHelper.processLanguage(
                cookie,
                param,
                req.headers,
                itemsGetter?.({ name: "language", type: "cookie" }),
                itemsGetter?.({ name: "language", type: "search" }),
            );
            const sessionIdKey =
                this._contributor?.findModule(
                    "request-handler.items-getter",
                    REQUEST_HANDLER_MODULE_ID,
                )?.({ name: "session", type: "cookie" }) || DEFAULT_REST_REQUEST_ITEM_MAP.session;
            const sessionId = cookie[sessionIdKey];

            const requestId = guid();

            const payload: RequestPayloadData = {
                body,
                param,
                cookie,
                headers,
                language,
                requestId,
                sessionId,

                url: req.url?.split("?")[0] || /* istanbul ignore next */ "",
                serviceId: this.id,
                type: "http",
                traceId: TraceHelper.generateTraceId(),
            };
            this._handleDispatch(payload, headers, req, res);
        });
    }
    private _handleDispatch(payload: RequestPayloadData, headers: MapOfString, req: IncomingMessage, res: ServerResponse): void {
        setTimeout(() => {
            const dispatcher = this._contributor?.findModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
            if (dispatcher) {
                const rest = this._rest
                    ? this._rest.mapping(payload.url)
                    : /* istanbul ignore next */ RestHelper.getRest(payload.url);
                if (rest) {
                    dispatcher({ rest, payload }).then(
                        (data) => this.onResponse(res, data),
                        (error) => {
                            const responseData: NetworkServiceResponseData = {
                                statusCode: ErrorHelper.getHttpStatusByJobStatus(error?.status),
                                headers,
                                body: {
                                    error: [
                                        {
                                            code: error?.error.code || SERVICE_ERROR_CODES.INTERNAL_ERROR,
                                            message: error?.error.message || "Technical error occurs when processing request.",
                                            error: error?.error.error,
                                        },
                                    ],
                                },
                            };
                            this.onResponse(res, responseData);
                        },
                    );
                } else {
                    this.onResponse(res, {
                        statusCode: HTTP_STATUS_CODE.NOT_FOUND,
                        headers,
                        body: {
                            error: [
                                {
                                    code: SERVICE_ERROR_CODES.REQUEST_PATH_INVALID,
                                    message: `Request "${payload.url}" is not accessiable, please check url and retry later.`,
                                },
                            ],
                        },
                    });
                }
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

        response.end(
            data.body ? (typeof data.body === "string" ? data.body : JSON.stringify(data.body)) : /* istanbul ignore next */ "",
        );
    }
}
