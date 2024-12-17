/** @format */

import { MapOfString, MapOfType } from "@aitianyu.cn/types";
import {
    DatabaseFieldType,
    IDatabaseConnectionConfig,
    IDatabaseFieldDefine,
    SupportedDatabaseType,
    TableIndexType,
} from "./api/database";

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
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            user: IDatabaseFieldDefine;
            level: IDatabaseFieldDefine;
            time: IDatabaseFieldDefine;
            msg: IDatabaseFieldDefine;
        };
    };
    usage: {
        database: string;
        table: string;
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            user: IDatabaseFieldDefine;
            func: IDatabaseFieldDefine;
            action: IDatabaseFieldDefine;
            time: IDatabaseFieldDefine;
            msg: IDatabaseFieldDefine;
        };
    };
    trace: {
        database: string;
        table: string;
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            user: IDatabaseFieldDefine;
            id: IDatabaseFieldDefine;
            time: IDatabaseFieldDefine;
            msg: IDatabaseFieldDefine;
            error: IDatabaseFieldDefine;
            area: IDatabaseFieldDefine;
        };
    };
    feature: {
        database: string;
        table: string;
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            id: IDatabaseFieldDefine;
            enable: IDatabaseFieldDefine;
            desc: IDatabaseFieldDefine;
            deps: IDatabaseFieldDefine;
        };
    };
    // monitor: {
    //     database: string;
    //     table: string;
    //     field: {
    //         feature: IDatabaseFieldDefine;
    //         time: IDatabaseFieldDefine;
    //         data: IDatabaseFieldDefine;
    //     };
    // };

    session: {
        database: string;
        table: string;
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            id: IDatabaseFieldDefine;
            user: IDatabaseFieldDefine;
            time: IDatabaseFieldDefine;
        };
    };
    user: {
        database: string;
        table: string;
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            id: IDatabaseFieldDefine;
            email: IDatabaseFieldDefine;
            skey: IDatabaseFieldDefine;
            name: IDatabaseFieldDefine;
            license: IDatabaseFieldDefine;
            team: IDatabaseFieldDefine;
        };
    };
    license: {
        database: string;
        table: string;
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            id: IDatabaseFieldDefine;
            name: IDatabaseFieldDefine;
            desc: IDatabaseFieldDefine;
            admin: IDatabaseFieldDefine;
        };
    };
    role: {
        database: string;
        table: string;
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            lid: IDatabaseFieldDefine;
            name: IDatabaseFieldDefine;

            read: IDatabaseFieldDefine;
            write: IDatabaseFieldDefine;
            delete: IDatabaseFieldDefine;
            change: IDatabaseFieldDefine;
            execute: IDatabaseFieldDefine;
        };
    };
    team: {
        database: string;
        table: string;
        index?: TableIndexType;
        data?: MapOfString[] | string;
        field: {
            id: IDatabaseFieldDefine;
            name: IDatabaseFieldDefine;
            desc: IDatabaseFieldDefine;
        };
    };
}
