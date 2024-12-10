/** @format */

import { DEFAULT_HTTP_HOST, DEFAULT_HTTP_PORT } from "#core/Constant";
import {
    HTTP_STATUS_CODE,
    HttpServiceOption,
    IHttpService,
    IRequestHandler,
    PayloadData,
    RequestType,
    NetworkServiceResponseData,
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
    private _handler: IRequestHandler;

    private _requestTable: Map<string, ServerResponse>;

    public constructor(handler: IRequestHandler, options?: HttpServiceOption) {
        this._id = guid();
        this._host = options?.host || DEFAULT_HTTP_HOST;
        this._port = options?.port || DEFAULT_HTTP_PORT;

        this._requestTable = new Map<string, ServerResponse>();

        this._handler = handler;

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
        this._handler.register(this);
        this._server.listen(this._port, this._host);
    }
    public close(): void {
        this._handler.unregister(this.id);
        this._server.close();
    }
    public resolve(requestId: string, data: NetworkServiceResponseData): void {
        const response = this._requestTable.get(requestId);
        if (response) {
            this._requestTable.delete(requestId);

            response.statusCode = data.statusCode;
            for (const key of Object.keys(data.headers)) {
                response.setHeader(key, data.headers[key]);
            }

            response.end(JSON.stringify(data.body));
        }
    }

    private onGet(req: IncomingMessage, res: ServerResponse): void {
        const param = HttpHelper.processParameters(req.url || "");
        const cookie = HttpHelper.processCookie(req.headers.cookie || "");
        const headers = HttpHelper.processHeader(req.headers);
        const language = HttpHelper.processLanguage(
            cookie,
            param,
            req.headers,
            this._handler.getRequestItem("language", "cookie"),
            this._handler.getRequestItem("language", "search"),
        );
        const requestId = guid();

        const payload: PayloadData = {
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

        this._requestTable.set(requestId, res);
        this._handler.dispatch(payload);
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
            const language = HttpHelper.processLanguage(
                cookie,
                param,
                req.headers,
                this._handler.getRequestItem("language", "cookie"),
                this._handler.getRequestItem("language", "search"),
            );
            const requestId = guid();

            const payload: PayloadData = {
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

            this._requestTable.set(requestId, res);
            this._handler.dispatch(payload);
        });
    }
    private onInvalidCall(req: IncomingMessage, res: ServerResponse): void {
        res.statusCode = HTTP_STATUS_CODE.METHOD_NOT_ALLOWED;
        res.end("");
    }
}
