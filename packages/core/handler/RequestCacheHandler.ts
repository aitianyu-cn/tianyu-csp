/** @format */

import { RequestPayloadData, HttpRequestCacheOption, NetworkServiceResponseData, HttpServerCacheSetting } from "#interface";
import { MapOfString, MapOfType, ObjectCalculater, ObjectHelper } from "@aitianyu.cn/types";

const DEFAULT_REQUEST_CACHE_TIMEOUT = 300000;
const DEFAULT_REQUEST_CACHE_WATCHDOG = DEFAULT_REQUEST_CACHE_TIMEOUT * 10;

export interface RequestCacheDocument {
    time: number;
    req: any;
    cookie: MapOfType<string | undefined>;
    header: MapOfType<string | undefined>;
    param: MapOfType<string | undefined>;
    response: NetworkServiceResponseData;
}

export class RequestCacheHandler {
    private _cache: Map<string, RequestCacheDocument[]>;
    private _setting: HttpServerCacheSetting;
    private _timer: NodeJS.Timeout | null;

    public constructor(setting: HttpServerCacheSetting) {
        this._setting = setting;
        this._cache = new Map<string, RequestCacheDocument[]>();

        this._timer = null;
    }

    public async readCache(
        payload: RequestPayloadData,
        option?: HttpRequestCacheOption,
    ): Promise<NetworkServiceResponseData | null> {
        if (!option || payload.disableCache) {
            return null;
        }

        if (this._setting.type === "database") {
            return this._setting.reader?.(payload, option) || null;
        }

        const key = this.formatKey(!!option.session, payload.sessionId, payload.url);
        const document = this.readCacheInternal(key, payload, option);

        return document;
    }

    public writeCache(payload: RequestPayloadData, response: NetworkServiceResponseData, option?: HttpRequestCacheOption): void {
        if (!option || payload.disableCache) {
            return;
        }

        if (this._setting.type === "database") {
            this._setting.writer?.(response, payload, option);
            return;
        }

        const key = this.formatKey(!!option.session, payload.sessionId, payload.url);

        const documents = this._cache.get(key) || [];

        // to remove current cached data
        const newDocuments = documents.filter((doc) => {
            return (
                !this.checkMap(doc.cookie, payload.cookie) ||
                !this.checkMap(doc.header, payload.headers) ||
                !this.checkMap(doc.param, payload.param) ||
                ObjectHelper.compareObjects(doc.req, payload.body) === "different"
            );
        });

        newDocuments.unshift({
            time: Date.now(),
            req: ObjectHelper.clone(payload.body),
            cookie:
                option.type === "full"
                    ? ObjectHelper.clone(payload.cookie)
                    : this.generateMap(option.cookie || [], payload.cookie),
            header:
                option.type === "full"
                    ? ObjectHelper.clone(payload.headers)
                    : this.generateMap(option.header || [], payload.headers),
            param:
                option.type === "full" ? ObjectHelper.clone(payload.param) : this.generateMap(option.params || [], payload.param),
            response: ObjectHelper.clone(response),
        });

        this._cache.set(key, newDocuments);
    }

    public start(): void {
        if (this._setting.type === "database" && this._setting.cycle) {
            if (this._timer) {
                clearInterval(this._timer);
            }

            this._timer = setInterval(this._setting.cycle, this._setting.watch || DEFAULT_REQUEST_CACHE_WATCHDOG);
        }
    }

    public destroy(): void {
        if (this._setting.type === "database") {
            if (this._timer) {
                clearInterval(this._timer);
            }

            this._setting.clean?.();
        } else {
            this._cache.clear();
        }
    }

    private readCacheInternal(
        key: string,
        payload: RequestPayloadData,
        option: HttpRequestCacheOption,
    ): NetworkServiceResponseData | null {
        const documents = this._cache.get(key) || [];

        const target = documents.findIndex((doc) => {
            return (
                this.checkMap(doc.cookie, payload.cookie) &&
                this.checkMap(doc.header, payload.headers) &&
                this.checkMap(doc.param, payload.param) &&
                ObjectHelper.compareObjects(doc.req, payload.body) === "same"
            );
        });
        if (target === -1) {
            return null;
        }

        if (!this.validateTime(documents[target].time, option.timeout)) {
            documents.splice(target, 1);
            this._cache.set(key, documents);
            return null;
        }

        return documents[target].response;
    }

    private validateTime(time: number, timeout: number = DEFAULT_REQUEST_CACHE_TIMEOUT): boolean {
        const now = Date.now();
        const span = now - time;
        return span < timeout;
    }

    private checkMap(src: MapOfType<string | undefined>, target: MapOfString): boolean {
        for (const key of Object.keys(src)) {
            if (src[key] !== target[key]) {
                return false;
            }
        }

        return true;
    }

    private generateMap(keys: string[], src: MapOfString): MapOfType<string | undefined> {
        const target: MapOfType<string | undefined> = {};

        for (const key of keys) {
            target[key] = src[key];
        }

        return target;
    }

    private formatKey(forceSession: boolean, sessionId: string, sourceUrl: string): string {
        const url = this.formatUrl(sourceUrl);
        const key = forceSession ? `${sessionId}-${url}` : url;
        return key;
    }

    private formatUrl(url: string): string {
        if (!url) {
            return "";
        }

        return url
            .split("/")
            .filter((value) => !!value)
            .join(".");
    }
}
