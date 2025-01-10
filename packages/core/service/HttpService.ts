/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { HTTP_STATUS_CODE, HttpServiceOption, RequestPayloadData, ICSPContributorFactorProtocolMap } from "#interface";
import { IContributor } from "@aitianyu.cn/tianyu-app-fwk";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { AbstractHttpService, IHttpServerAction, IHttpServerLifecycle, IHttpServerListener } from "./AbstractHttpService";

/** Http 1.0 service */
export class HttpService extends AbstractHttpService<HttpServiceOption> {
    public constructor(options?: HttpServiceOption, contributor?: IContributor<ICSPContributorFactorProtocolMap>) {
        super(options, contributor);
    }

    protected override createServerInstance(): IHttpServerListener & IHttpServerLifecycle & IHttpServerAction {
        return createServer((req: IncomingMessage, res: ServerResponse) => {
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

    /**
     * handle http request if it is in get method
     *
     * @param req http request
     * @param res http response
     */
    private onGet(req: IncomingMessage, res: ServerResponse): void {
        const payload = this.generatePayload(req.url, req.headers);

        this._handleDispatch(payload, res);
    }
    /**
     * handle http request if it is in post method
     *
     * @param req http request
     * @param res http response
     */
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

            const payload = this.generatePayload(req.url, req.headers, body);

            this._handleDispatch(payload, res);
        });
    }
    /**
     * to process a request
     *
     * @param payload request info payload
     * @param headers request headers
     * @param req http request
     * @param res http response
     */
    private _handleDispatch(payload: RequestPayloadData, res: ServerResponse): void {
        setTimeout(async () => {
            const response = await this.dispatch(payload);

            res.statusCode = response.statusCode;

            for (const key of Object.keys(response.headers)) {
                res.setHeader(key, response.headers[key]);
            }

            res.end(
                response.body
                    ? typeof response.body === "string"
                        ? response.body
                        : JSON.stringify(response.body)
                    : /* istanbul ignore next */ "",
            );
        }, 0);
    }
    /**
     * to response a invalid call if the request method is not supported
     *
     * @param _req http request
     * @param res http response
     */
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
}
