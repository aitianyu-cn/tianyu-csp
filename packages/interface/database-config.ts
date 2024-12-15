/** @format */

import { IDatabaseConnectionConfig, SupportedDatabaseType } from "./api/database";

export interface TianyuCSPDatabaseConfig {
    [key: string]: IDatabaseConnectionConfig;
}

export interface TianyuCSPDatabaseTypes {
    [key: string]: SupportedDatabaseType;
}

export interface TianyuCSPSystemDBMap {
    logger: {
        database: string;
        table: string;
        field: {
            user: string;
            level: string;
            time: string;
            msg: string;
        };
    };
    usage: {
        database: string;
        table: string;
        field: {
            user: string;
            func: string;
            action: string;
            time: string;
            msg: string;
        };
    };
    trace: {
        database: string;
        table: string;
        field: {
            user: string;
            id: string;
            time: string;
            msg: string;
            error: string;
            area: string;
        };
    };
    feature: {
        database: string;
        table: string;
        field: {
            id: string;
            enable: string;
            desc: string;
            deps: string;
        };
    };

    session: {
        database: string;
        table: string;
        field: {
            id: string;
            user: string;
            time: string;
        };
    };
    user: {
        database: string;
        table: string;
        field: {
            id: string;
            email: string;
            skey: string;
            name: string;
            license: string;
            team: string;
        };
    };
    license: {
        database: string;
        table: string;
        field: {
            id: string;
            name: string;
            desc: string;
            admin: string;
        };
    };
    role: {
        database: string;
        table: string;
        field: {
            lid: string;
            name: string;

            read: string;
            write: string;
            delete: string;
            change: string;
            execute: string;
        };
    };
    team: {
        database: string;
        table: string;
        field: {
            id: string;
            name: string;
            desc: string;
        };
    };
}
