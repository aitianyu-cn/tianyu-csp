/** @format */

import { INFRA_ERROR_CODES } from "#core/Constant";
import {
    RedisValueType,
    RedisSupportedCommander,
    RedisValueDataStruct,
    RedisCommanderForString,
    RedisCommanderForList,
} from "#interface";
import { ErrorHelper } from "#utils/ErrorHelper";
import Redis, { ChainableCommander } from "ioredis";

export interface SqlUnzip {
    type: RedisValueType;
    /** execution cmd */
    cmd: keyof RedisSupportedCommander;
    /**
     * defined table name
     *
     * if primary key exist: table name is ignored
     * if primary key missing: table name will be key name and data type to be list
     */
    table: string;
    /**
     * database name of index
     *
     * can be a formatted index with name or default 0
     */
    db: string;
    /**
     * mapped primary key
     *
     * for list type, primary is empty
     */
    key: string[];
    /** to saved value */
    value: string;
    /**
     * custom structure for additonal operation
     */
    struct: RedisValueDataStruct;
}

export function validCommand(cmd: keyof RedisSupportedCommander, type: RedisValueType): boolean {
    switch (type) {
        case "string":
            switch (cmd) {
                case "set":
                case "get":
                case "mget":
                case "mset":
                case "incr":
                case "incrby":
                case "decr":
                case "decrby":
                case "incrbyfloat":
                case "append":
                case "strlen":
                case "setrange":
                case "getrange":
                    return true;
            }
            break;
        case "list":
            switch (cmd) {
                case "rpush":
                case "lpush":
                case "linsert":
                case "lrange":
                case "lindex":
                case "llen":
                case "lpop":
                case "rpop":
                case "lrem":
                case "ltrim":
                case "lset":
                case "blpop":
                case "brpop":
                    return true;
            }
            break;
    }

    throw ErrorHelper.getError(
        INFRA_ERROR_CODES.DATABASE_COMMAND_UNSUPPORT_FOR_TYPE,
        `Database command check failed: CMD (${cmd}) is not supported in data type (${type})`,
    );
}

function generateRecorderKey(table: string, key: string[], struct: RedisValueDataStruct): string {
    // to generate a actual db recorder key
    const recorderKey =
        key
            .map((subkey) => struct.data[subkey])
            .filter((subkeyVal) => !!subkeyVal)
            .join("_") || table;

    return recorderKey;
}

function setterCallback(
    resolve: (value: void | PromiseLike<void>) => void,
    reject: (reason?: any) => void,
    cmd: string,
    value: string,
    error?: Error | null,
): void {
    if (error) {
        reject(
            ErrorHelper.getError(
                INFRA_ERROR_CODES.DATABASE_QUERY_EXECUTION_ERROR,
                `Command '${cmd}' with values (${value}) executed failed.`,
                error.message,
            ),
        );
        return;
    }
    resolve();
}

export const runnerMap: {
    [key in keyof RedisSupportedCommander]: (
        executor: Redis,
        { table, db, key, value, struct }: Omit<SqlUnzip, "cmd">,
    ) => Promise<any>;
} = {
    set: async function (
        executor: ChainableCommander | Redis,
        { table, key, value, struct }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        const realKey = generateRecorderKey(table, key, struct);
        return new Promise<void>((resolve, reject) => {
            executor.set(realKey, value, "GET", (error?: Error | null) => {
                setterCallback(resolve, reject, "set", value, error);
            });
        });
    },
    get: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        const realKey = generateRecorderKey(table, key, struct);
        return new Promise<any>((resolve, reject) => {
            executor.get(realKey, (error?: Error | null, result?: string | null) => {
                //
            });
        });
    },
    mget: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    mset: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    incr: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    incrby: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    decr: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    decrby: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    incrbyfloat: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    append: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    strlen: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    setrange: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    getrange: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    rpush: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    lpush: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    linsert: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    lrange: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    lindex: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    llen: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    lpop: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    rpop: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    lrem: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    ltrim: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    lset: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    blpop: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
    brpop: async function (
        executor: ChainableCommander | Redis,
        { table, db, key, value, struct, type }: Omit<SqlUnzip, "cmd">,
    ): Promise<any> {
        throw new Error("Function not implemented.");
    },
};
