/** @format */

import {
    Http2ServiceOption,
    HTTP_STATUS_CODE,
    HttpCallMethod,
    HttpProtocal,
    HttpSecurityOption,
    ICSPContributorFactorProtocolMap,
    IHttp2Events,
    RequestPayloadData,
} from "#interface";
import { createSecureServer, Http2SecureServer, IncomingHttpHeaders, OutgoingHttpHeaders, ServerHttp2Stream } from "http2";
import { IContributor } from "@aitianyu.cn/tianyu-app-fwk";
import { AbstractHttpService, IHttpServerAction, IHttpServerLifecycle, IHttpServerListener } from "./AbstractHttpService";
import { SERVICE_ERROR_CODES } from "#core/Constant";

export class Http2Service extends AbstractHttpService<Http2ServiceOption, IHttp2Events> {
    protected declare _server: Http2SecureServer;

    public constructor(options?: Http2ServiceOption, contributor?: IContributor<ICSPContributorFactorProtocolMap>) {
        super(options, contributor);

        this.setupEvents();
    }

    protected override createServerInstance(
        option?: Http2ServiceOption,
    ): IHttpServerListener & IHttpServerLifecycle & IHttpServerAction {
        const securityOpt: HttpSecurityOption = option || /* istanbul ignore next */ {};
        const server = createSecureServer(securityOpt);

        server.on("stream", this.onStream.bind(this));

        return server;
    }

    protected get protocol(): HttpProtocal {
        return "http2";
    }

    private setupEvents(): void {
        this.on("authorization-changed", (option) => {
            this._server.setSecureContext(option);
        });
    }

    private onStream(stream: ServerHttp2Stream, header: IncomingHttpHeaders, flags: number): void {
        switch (header[":method"]?.toUpperCase()) {
            case "GET":
                this.onGet(stream, header, flags);
                break;
            case "POST":
                this.onPost(stream, header, flags);
                break;
            default:
                this.onInvalidCall(stream);
                break;
        }
    }

    private onGet(stream: ServerHttp2Stream, header: IncomingHttpHeaders, _flags: number): void {
        const payload = this.generatePayload(header[":path"], header, "GET");
        this._handleDispatch(payload, stream, "GET");
    }

    private onPost(stream: ServerHttp2Stream, header: IncomingHttpHeaders, _flags: number): void {
        let data: string = "";

        stream.on("data", (chunk) => {
            data += chunk;
        });

        stream.on("end", () => {
            let body: any = null;
            try {
                body = JSON.parse(decodeURI(data));
            } catch {}

            const payload = this.generatePayload(header[":path"], header, "POST", body);
            this._handleDispatch(payload, stream, "POST");
        });
    }

    private onInvalidCall(stream: ServerHttp2Stream): void {
        setTimeout(() => {
            const resBody = {
                error: [
                    {
                        code: SERVICE_ERROR_CODES.REQUEST_METHOD_NOT_SUPPORT,
                        message: "Request method handler is not found, please ensure your http request uses correct method.",
                    },
                ],
            };
            stream.respond({
                ":status": HTTP_STATUS_CODE.METHOD_NOT_ALLOWED,
                "content-type": "application/json; charset=utf-8",
            });
            stream.end(JSON.stringify(resBody));
        }, 0);
    }

    private _handleDispatch(payload: RequestPayloadData, stream: ServerHttp2Stream, method: HttpCallMethod): void {
        setTimeout(async () => {
            const response = await this.dispatch(payload, method);

            const header: OutgoingHttpHeaders = {
                ...response.headers,
                ":status": response.statusCode,
            };

            stream.respond(header);
            stream.end(
                this.encodeResponse(
                    response.body
                        ? typeof response.body === "string"
                            ? response.body
                            : JSON.stringify(response.body)
                        : /* istanbul ignore next */ "",
                    header,
                ),
            );
        }, 0);
    }
}
