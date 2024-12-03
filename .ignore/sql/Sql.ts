/** @format */

import { KeyValuePair } from "@aitianyu.cn/types";

export type SqlOperationType = "select" | "insert" | "update" | "delete" | "truncate";

export type SqlOrderType = "asc" | "desc";

export type SqlLogicRelationType = "and" | "or";

export type SqlJoinType = "inner" | "left" | "right" | "outer" | "cross" | "self" | "natural";

export type SqlFunctionType = "avg" | "count" | "first" | "last" | "max" | "min" | "sum" | "";

export interface SqlColumeValuePair {
    col: string;
    rename?: string;
    value: string | number;
}

export interface SqlConditionsMap {
    pairs: (KeyValuePair<string, string | number | (string | number)[]> | SqlConditionsMap)[];
    custom: string[];
    relation: SqlLogicRelationType;
}

export interface SqlJoinConfig {
    type: SqlJoinType;

    condition: {
        table: string;
        from: { table: string; col: string };
        to: { table: string; col: string };
    }[];
}

export interface SqlInStruct {
    database: string;
    table: string;

    operate: SqlOperationType;
    pairs: SqlColumeValuePair[];
    conditions?: SqlConditionsMap;
    options?: {
        limit?: number;
        offset?: number;
        order?: {
            cols: string[];
            type: SqlOrderType;
        };
        distinct?: boolean;
        group?: string;
    };
    join?: SqlJoinConfig;
    union?: {
        sql: SqlInStruct | string;
        all?: boolean;
    };
}
