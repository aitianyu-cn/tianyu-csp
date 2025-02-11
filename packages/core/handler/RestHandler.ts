/** @format */

import { guid, MapOfString, MapOfType, ObjectHelper } from "@aitianyu.cn/types";
import { DEFAULT_REST_FALLBACK } from "./RestHandlerConstant";
import { HttpCallMethod, HttpRestItem, HttpRestResult, PathEntry, RestMappingResult, Subitem, SubitemType } from "#interface";

const PARAM_REGEX = /\{([0-9|a-z|A-Z\_\-]+(?:\s*,[^{}]*)?)\}/;

/**
 *
 * Rest handler used to process rest url mapping and generic a target map to do the execution call
 *
 * @description
 * Rest support the following types of structures:
 *  1. full path: /a/b/c
 *      this path will map to /a/b/c directly
 *
 *  2. param path: /a/{b}/c
 *
 *      (a) this path will map to /a/{param url}/c, the {param url} will be the input argument which can
 *      be used in the package, module and method item.
 *
 *      (b) if the request url is "/a/test/c", the target rest data will be.
 *
 *  3. pre-map path: /a/b/*
 *      this path will map any url which is start with "/a/b".
 *
 * The three types of structures if all defined, only one item will be mapped. the mapping priority
 * is: 1 -> 2 -> 3.
 *
 * if path structure 1 is mapped, return info of path - 1
 * if path structure 1 is not mapped, to map path structure 2.
 * if path structure 2 is not mapped, to map path strucutre 3.
 *
 * @example (a)
 *
 * "/a/{b}/c": {
 *      "package": "P1.P2.{b}.P3",
 *      "module": "{b}Handler",
 *      "method": "{b}"
 * }
 *
 * @example (b)
 * {
 *      "package": "P1.P2.test.P3",
 *      "module": "testHandler",
 *      "method": "test"
 * }
 *
 */
export class RestHandler {
    private _fallback: PathEntry | null;
    private _resttree: Subitem;
    private _rest: MapOfType<{ path: string; level: number; entry: HttpRestItem }>;

    public constructor(rest?: MapOfType<HttpRestItem>, enableFallbackOrFallback?: boolean | PathEntry) {
        this._resttree = {
            id: null,
            actual: {},
            param: {},
            generic: null,
        };
        this._fallback = enableFallbackOrFallback
            ? typeof enableFallbackOrFallback === "boolean"
                ? DEFAULT_REST_FALLBACK
                : enableFallbackOrFallback
            : null;
        this._rest = {};

        this._processRest(rest || {});
    }

    /**
     * To process a source rest definition to be rest tree
     *
     * @param rest source rest map
     */
    private _processRest(rest: MapOfType<HttpRestItem>): void {
        const raw_rest = rest;

        for (const key of Object.keys(raw_rest)) {
            const entry = raw_rest[key];
            const paths = this._processPath(key);
            this._processTree(key, paths, entry);
        }
    }

    /**
     * To process rest tree
     *
     * @param rest rest name - request path
     * @param path response path items array
     * @param entry path entry package
     */
    private _processTree(rest: string, path: string[], entry: HttpRestItem): void {
        let tree = this._resttree;
        for (const item of path) {
            const type = this._convertItemType(item);
            const itemname = type === "param" ? item.substring(1, item.length - 1) : item;
            if (type === "generic") {
                if (!tree["generic"]) {
                    tree = tree[type] = {
                        id: null,
                        actual: {},
                        param: {},
                        generic: null,
                    };
                }
                break;
            } else {
                if (!tree[type][itemname]) {
                    tree[type][itemname] = {
                        id: null,
                        actual: {},
                        param: {},
                        generic: null,
                    };
                }
                tree = tree[type][itemname];
            }
        }

        tree.id = guid();
        this._rest[tree.id] = {
            path: rest,
            level: path.length,
            entry,
        };
    }

    /**
     * To split path to be directories array
     *
     * @param path source path
     * @returns directories array
     */
    private _processPath(path: string): string[] {
        const raw_path = path.trim();
        if (!raw_path || raw_path === "/") {
            return [];
        }

        const result: string[] = raw_path
            .split("/")
            .map((item) => item.trim())
            .filter((item) => !!item);

        return result;
    }

    /**
     * To get the type of a directory
     *
     * @param item directory name
     * @returns return the directory type
     */
    private _convertItemType(item: string): SubitemType {
        return item === "*" ? "generic" : PARAM_REGEX.test(item) ? "param" : "actual";
    }

    /**
     * To format the path module package from request url path
     *
     * @param source source package string
     * @param args request url path matched items map
     * @returns return a formatted string
     */
    private _format(source: string, args: MapOfString): string {
        /* istanbul ignore if */
        if (!args) {
            return source;
        }

        return source.replace(/\{([0-9|a-z|A-Z\_\-]+(?:\s*,[^{}]*)?)\}|[{}]/g, (_match, $1) => {
            if ($1) {
                return String(args[$1]);
            }
            return "";
        });
    }

    /**
     * To get a request execution module package by request url
     *
     * @param url request url
     * @returns return a package path, return null if the path is not found
     */
    public mapping(url: string, method: HttpCallMethod): RestMappingResult {
        const path = this._processPath(url.split("?")[0]);

        const mappeds: { id: string; type: SubitemType; params: MapOfString }[] = [];

        this._map(path, method, 0, this._resttree, "actual", {}, mappeds);

        return this._filter(mappeds, method);
    }

    /**
     * To found a nearest rest from url
     *
     * @param url source url
     * @param index search url index
     * @param subitem rest tree
     * @param type current searched rest item type
     * @param params parameter map
     * @param mappeds mapped rests list
     */
    private _map(
        url: string[],
        method: HttpCallMethod,
        index: number,
        subitem: Subitem,
        type: SubitemType,
        params: MapOfString,
        mappeds: { id: string; type: SubitemType; params: MapOfString }[],
    ): void {
        if (index < url.length) {
            const pathName = url[index];
            if (subitem.actual[pathName]) {
                this._map(url, method, index + 1, subitem.actual[pathName], "actual", ObjectHelper.clone(params), mappeds);
            }

            for (const item of Object.keys(subitem.param)) {
                const newparam = ObjectHelper.clone(params);
                newparam[item] = url[index];
                this._map(url, method, index + 1, subitem.param[item], "param", ObjectHelper.clone(newparam), mappeds);
            }

            if (subitem.generic?.id) {
                const item = this._rest[subitem.generic?.id];
                if (item.entry.handlers?.[method] || item.entry.handler || (!item.entry.handlers && !item.entry.handler)) {
                    // this._map(url, index + 1, subitem.generic, "generic", ObjectHelper.clone(params), mappeds);
                    mappeds.push({ id: subitem.generic.id, type: "generic", params });
                }
            }
        } else if (index === url.length) {
            if (subitem.id) {
                const item = this._rest[subitem.id];
                if (item.entry.handlers?.[method] || item.entry.handler || (!item.entry.handlers && !item.entry.handler)) {
                    mappeds.push({ id: subitem.id, type, params });
                }
            } else if (subitem.generic?.id) {
                const item = this._rest[subitem.generic?.id];
                if (item.entry.handlers?.[method] || item.entry.handler || (!item.entry.handlers && !item.entry.handler)) {
                    mappeds.push({ id: subitem.generic.id, type: "generic", params });
                }
            }
        }
    }

    /**
     * to filter a best rest package of url
     *
     * @param maps mapped rest list
     * @returns return a best rest package, return null if no rest package mapped
     */
    private _filter(maps: { id: string; type: SubitemType; params: MapOfString }[], method: HttpCallMethod): RestMappingResult {
        if (!maps.length) {
            return this._fallback ? { handler: this._fallback } : null;
        }

        let item = maps[0];
        for (let index = 0; index < maps.length; ++index) {
            const next = this._rest[maps[index].id];
            const curr = this._rest[item.id];

            const isNextDeepth = next.level > curr.level;
            const isNextAccurate =
                next.level === curr.level &&
                ((item.type === "generic" && (maps[index].type === "param" || maps[index].type === "actual")) ||
                    (maps[index].type === "param" && maps[index].type === "actual"));

            /* istanbul ignore if */
            if (isNextDeepth || isNextAccurate) {
                item = maps[index];
            }
        }

        const entry = this._rest[item.id].entry;
        const handler = entry.handlers?.[method] || entry.handler;
        const result: HttpRestResult = {
            handler: {
                package: this._format(handler?.package || "", item.params),
                module: this._format(handler?.module || "", item.params),
                method: this._format(handler?.method || "default", item.params),
            },
            cache: entry.cache,
            proxy: entry.proxy,
        };

        return result;
    }
}
