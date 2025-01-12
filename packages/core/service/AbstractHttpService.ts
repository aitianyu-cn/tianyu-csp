/** @format */

import { DEFAULT_HTTP_HOST, DEFAULT_HTTP_PORT, SERVICE_ERROR_CODES } from "#core/Constant";
import { RequestCacheHandler } from "#core/handler/RequestCacheHandler";
import { RestHandler } from "#core/handler/RestHandler";
import { REST } from "#core/handler/RestHandlerConstant";
import {
    DefaultRequestItemsMap,
    DefaultRequestItemTargetType,
    HTTP_STATUS_CODE,
    HttpRequestCacheOption,
    HttpRestItem,
    HttpServiceOption,
    ICSPContributorFactorProtocolMap,
    IHttpService,
    ImportPackage,
    NetworkServiceResponseData,
    PathEntry,
    REQUEST_HANDLER_MODULE_ID,
    RequestPayloadData,
    RequestType,
} from "#interface";
import { ErrorHelper, HttpHelper, RestHelper, TraceHelper } from "#utils";
import { IContributor } from "@aitianyu.cn/tianyu-app-fwk";
import { getBoolean, guid, MapOfType } from "@aitianyu.cn/types";
import { DISPATCH_ERROR_RESPONSES } from "./HttpServiceConstant";
import { DEFAULT_REST_REQUEST_ITEM_MAP } from "#core/infra/Constant";
import { IncomingHttpHeaders } from "http";

export interface IHttpServerListener {
    listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
}

export interface IHttpServerLifecycle {
    close(callback?: (err?: Error) => void): this;
}

export interface IHttpServerAction {
    on(event: "error", listener: (err: Error) => void): this;
}

export abstract class AbstractHttpService<OPT extends HttpServiceOption> implements IHttpService {
    private _id: string;
    private _host: string;
    private _port: number;
    private _server: IHttpServerListener & IHttpServerLifecycle & IHttpServerAction;

    private _rest: RestHandler | null;
    private _restMap?: MapOfType<ImportPackage>;
    private _restFallback?: PathEntry;

    private _cacheHandler?: RequestCacheHandler;
    private _contributor?: IContributor<ICSPContributorFactorProtocolMap>;

    public constructor(options?: OPT, contributor?: IContributor<ICSPContributorFactorProtocolMap>) {
        this._id = guid();
        this._host = options?.host || /* istanbul ignore next */ DEFAULT_HTTP_HOST;
        this._port = options?.port || /* istanbul ignore next */ DEFAULT_HTTP_PORT;

        this._contributor = contributor;

        this._rest =
            options?.advanceRest === undefined || options?.advanceRest
                ? new RestHandler(options?.rest || REST, options?.enablefallback && options?.fallback)
                : null;
        this._restMap = options?.rest;
        this._restFallback = options?.fallback;

        this._cacheHandler = options?.cache && new RequestCacheHandler(options.cache);

        this._server = this.createServerInstance(options);
        this._server.on("error", this.onError.bind(this));
    }

    public get id(): string {
        return this._id;
    }

    public get type(): RequestType {
        return "http";
    }

    public listen(): void {
        this._cacheHandler?.start();
        this._server.listen(this._port, this._host);
    }

    public close(callback?: (err?: Error) => void): void {
        this._cacheHandler?.destroy();
        this._server.close(callback);
    }

    protected async dispatch(payload: RequestPayloadData): Promise<NetworkServiceResponseData> {
        const dispatcher = this._contributor?.findModule("request-handler.dispatcher", REQUEST_HANDLER_MODULE_ID);
        if (!dispatcher) {
            return DISPATCH_ERROR_RESPONSES["dispatch-invalid"](payload);
        }

        const rest = this.getRest(payload.url);
        let response = rest
            ? (await this._cacheHandler?.readCache(payload, rest?.cache)) ||
              (await dispatcher({ rest: RestHelper.toPathEntry(rest), payload }).then(
                  (response) => {
                      if (response.statusCode === HTTP_STATUS_CODE.OK) {
                          this._cacheHandler?.writeCache(payload, response, rest.cache);
                      }
                      return response;
                  },
                  (error) => DISPATCH_ERROR_RESPONSES["dispatch-request-error"](payload, error),
              ))
            : DISPATCH_ERROR_RESPONSES["rest-not-found"](payload);
        return response;
    }

    protected generatePayload(url: string | undefined, header: IncomingHttpHeaders, body?: undefined): RequestPayloadData {
        const param = HttpHelper.processParameters(url || /* istanbul ignore next */ "");
        const cookie = HttpHelper.processCookie(header.cookie || /* istanbul ignore next */ "");
        const headers = HttpHelper.processHeader(header);

        const items = this.convertRequestItems([
            { name: "language", type: "cookie" },
            { name: "language", type: "search" },
            { name: "session", type: "cookie" },
            { name: "disableCache", type: "search" },
        ]);
        const language = HttpHelper.processLanguage(cookie, param, header, items[0], items[1]);
        const sessionIdKey = items[2] || DEFAULT_REST_REQUEST_ITEM_MAP.session;

        const sessionId = cookie[sessionIdKey];

        const requestId = guid();

        const payload: RequestPayloadData = {
            param,
            cookie,
            headers,
            language,
            requestId,
            sessionId,

            url: url?.split("?")[0] || /* istanbul ignore next */ "",
            body: body || null,
            serviceId: this.id,
            type: "http",
            traceId: TraceHelper.generateTraceId(),
            disableCache: getBoolean(param[items[3] || DEFAULT_REST_REQUEST_ITEM_MAP.disableCache]),
        };

        return payload;
    }

    private onError(error: Error): void {
        TIANYU.logger.error(
            ErrorHelper.getErrorString(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                `http server error on ${this._host}:${this._port} - ${error.message}`,
                error.stack,
            ),
        );
    }

    private getRest(url: string): HttpRestItem | null {
        return this._rest ? this._rest.mapping(url) : RestHelper.getRest(url, this._restMap, this._restFallback);
    }

    private convertRequestItems(
        data: {
            name: keyof DefaultRequestItemsMap;
            type: DefaultRequestItemTargetType;
        }[],
    ): (string | undefined)[] {
        if (!data.length) {
            return [];
        }

        const itemsGetter = this._contributor?.findModule("request-handler.items-getter", REQUEST_HANDLER_MODULE_ID);
        return data.map((item) => itemsGetter?.(item));
    }

    protected abstract createServerInstance(opt?: OPT): IHttpServerListener & IHttpServerLifecycle & IHttpServerAction;
}
