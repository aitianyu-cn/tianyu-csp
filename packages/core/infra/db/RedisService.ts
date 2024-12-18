/** @format */

import { INFRA_ERROR_CODES } from "#core/Constant";
import { IDBConnection, IDBLifecycle, RedisValueDataStruct } from "#interface";
import { DBHelper } from "#utils/DBHelper";
import { ErrorHelper } from "#utils/ErrorHelper";
import { ObjectHelper } from "#utils/ObjectHelper";
import Redis, { ChainableCommander, RedisOptions } from "ioredis";
import { runnerMap, SqlUnzip, validCommand } from "./RedisRunnerMap";

export class RedisService implements IDBConnection, IDBLifecycle {
    private _database: string;
    private _redis: Redis;

    public constructor(databaseName: string, config: RedisOptions) {
        this._database = databaseName;
        this._redis = new Redis(config);
    }

    public get name(): string {
        return this._database;
    }

    public async execute(sql: string): Promise<void> {
        if (!sql) {
            return;
        }

        await this.executeInternal(this._redis, sql);
    }

    public async executeBatch(sql: string[]): Promise<void> {
        if (!sql.length) {
            return;
        }

        const executionPromise: Promise<void>[] = [];
        for (const s of sql) {
            executionPromise.push(this.executeInternal(this._redis, s));
        }

        Promise.all(executionPromise).catch(async (error) => {
            return Promise.reject(
                ErrorHelper.getError(
                    INFRA_ERROR_CODES.DATABASE_QUERY_EXECUTION_ERROR,
                    `Database (${this._database}) Query Execution Failed`,
                    error.message,
                ),
            );
        });
    }

    public async query(sql: string): Promise<any> {
        if (!sql) {
            return [];
        }

        const data = await this.unzipSql(sql);
        return new Promise<any>((resolve, reject) => {
            runnerMap[data.cmd](this._redis, data).then(resolve, (error) => {
                ErrorHelper.getError(
                    INFRA_ERROR_CODES.DATABASE_QUERY_EXECUTION_ERROR,
                    `Database (${this._database}) Query ("${sql}") Execution Failed`,
                    error.message,
                );
            });
        });
    }

    public close(): void {
        this._redis.disconnect();
    }

    private async executeInternal(executor: Redis, sql: string): Promise<void> {
        const data = await this.unzipSql(sql);
        await runnerMap[data.cmd](executor, data);
    }

    private async unzipSql(sql: string): Promise<SqlUnzip> {
        const commandData = DBHelper.redis.parse(sql);
        if (commandData.cmd === "unknown") {
            return Promise.reject(
                ErrorHelper.getError(
                    INFRA_ERROR_CODES.DATABASE_COMMAND_INVALID,
                    `Database (${this._database}) Execute command (${sql}) with Command not supported.`,
                ),
            );
        }
        if (!commandData.db || !commandData.table) {
            return Promise.reject(
                ErrorHelper.getError(
                    INFRA_ERROR_CODES.DATABASE_COMMAND_INVALID,
                    `Database (${this._database}) Execute command (${sql}) missing database or table name.`,
                ),
            );
        }

        const valueParse: RedisValueDataStruct = (commandData.value &&
            (ObjectHelper.parse(commandData.value) as RedisValueDataStruct | null)) || { data: {} };
        if (!valueParse) {
            return Promise.reject(
                ErrorHelper.getError(
                    INFRA_ERROR_CODES.DATABASE_COMMAND_INVALID,
                    `Database (${this._database}) Execute command (${sql}) value type not supported.`,
                ),
            );
        }

        const struct = DBHelper.redis.struct(commandData.db, commandData.table);
        validCommand(commandData.cmd, struct.type);

        return {
            table: commandData.table,
            db: commandData.db,
            type: struct.type,
            key: struct.key,
            struct: valueParse,
            value: ObjectHelper.stringify(valueParse.data),
            cmd: commandData.cmd,
        };
    }
}
