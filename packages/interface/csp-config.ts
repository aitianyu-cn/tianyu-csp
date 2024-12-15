/** @format */

import { DefaultRequestItemsMap } from "./fwk-def/contributor/requests";

export interface TianyuCSPRestPathEntry {
    package?: string;
    module?: string;
    method?: string;
}

export interface TianyuCSPRequestMapItem {
    cookie: string;
    search: string;
}

export interface TianyuCSPConfig {
    config?: {
        name?: string;
        version?: string;
        environment?: "development" | "production";
        src?: string;
        language?: string;
    };
    rest?: {
        file: string;
        "request-map"?: DefaultRequestItemsMap;
        fallback?: TianyuCSPRestPathEntry;
        loader?: string;
    };
    database?: {
        file?: string;
        rename?: {
            types?: string;
            configs?: string;
            sys?: string;
        };
    };
    user?: {
        login?: number;
        session_life?: number;
    };
}
