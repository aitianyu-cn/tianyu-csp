/** @format */

import { IDBConnection, IDBLifecycle } from "#interface";
import { ErrorHelper } from "#utils/ErrorHelper";
import * as mysql from "mysql";
import { INFRA_ERROR_CODES } from "../../Constant";

export class MysqlService implements IDBConnection, IDBLifecycle {
    private _database: string;
    private _pool: mysql.Pool;

    public constructor(databaseName: string, config: mysql.ConnectionConfig) {
        this._database = databaseName;
        this._pool = mysql.createPool({ ...config, database: databaseName });
    }

    public async execute(sql: string): Promise<void> {
        if (!sql) {
            return;
        }

        const connection = await this._getConnection();
        return new Promise<void>((resolve, reject) => {
            connection.query(sql, (error: mysql.MysqlError | null) => {
                connection.end();

                if (error) {
                    if (error) {
                        reject(
                            ErrorHelper.getError(
                                INFRA_ERROR_CODES.DATABASE_QUERY_EXECUTION_ERROR,
                                `Database (${this._database}) Query ("${sql}") Execution Failed`,
                                error.message,
                            ),
                        );
                        return;
                    }

                    resolve();
                }
            });
        });
    }
    public async executeBatch(sqls: string[]): Promise<void> {
        if (!sqls.length) {
            return;
        }

        const connection = await this._getConnection();
        return new Promise<void>((resolve, reject) => {
            connection.beginTransaction((transactionError: mysql.MysqlError | null) => {
                if (transactionError) {
                    reject(
                        ErrorHelper.getError(
                            INFRA_ERROR_CODES.DATABASE_QUERY_TRANSACTION_ERROR,
                            `Database (${this._database}) Transaction Operation Failed`,
                            transactionError.message,
                        ),
                    );
                }

                const queryPromises: Promise<void>[] = [];
                for (const sql of sqls) {
                    queryPromises.push(
                        new Promise<void>((done, fail) => {
                            connection.query(sql, (error: mysql.MysqlError | null) => {
                                if (error) {
                                    if (error) {
                                        fail(
                                            ErrorHelper.getError(
                                                INFRA_ERROR_CODES.DATABASE_QUERY_EXECUTION_ERROR,
                                                `Database (${this._database}) Query ("${sql}") Execution Failed`,
                                                error.message,
                                            ),
                                        );
                                        return;
                                    }
                                    done();
                                }
                            });
                        }),
                    );
                }

                Promise.all(queryPromises)
                    .then(
                        () => {
                            connection.commit();
                            resolve();
                        },
                        (error) => {
                            connection.rollback();
                            reject(
                                ErrorHelper.getError(
                                    INFRA_ERROR_CODES.DATABASE_BATCH_QUERY_EXECUTION_ERROR,
                                    `Database (${this._database}) Transaction Query Execution Failed`,
                                    error.error || error.message,
                                ),
                            );
                        },
                    )
                    .finally(() => {
                        if (connection.threadId) {
                            connection.end();
                        }
                    });
            });
        });
    }
    public async query(sql: string): Promise<any> {
        if (!sql) {
            return [];
        }

        const connection = await this._getConnection();
        return new Promise<any>((resolve, reject) => {
            connection.query(sql, (error: mysql.MysqlError | null, result?: any) => {
                connection.end();

                if (error) {
                    if (error) {
                        reject(
                            ErrorHelper.getError(
                                INFRA_ERROR_CODES.DATABASE_QUERY_EXECUTION_ERROR,
                                `Database (${this._database}) Query ("${sql}") Execution Failed`,
                                error.message,
                            ),
                        );
                        return;
                    }

                    resolve(result);
                }
            });
        });
    }

    public close(): void {
        this._pool.end();
    }

    private async _getConnection(): Promise<mysql.PoolConnection> {
        return new Promise<mysql.PoolConnection>((resolve, reject) => {
            try {
                this._pool.getConnection((error: mysql.MysqlError | null, connection: mysql.PoolConnection) => {
                    if (error) {
                        reject(
                            ErrorHelper.getError(
                                INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR,
                                `Database (${this._database}) Connection Create Failed`,
                                error.message,
                            ),
                        );
                        return;
                    }

                    resolve(connection);
                });
            } catch (e) {
                reject(
                    ErrorHelper.getError(
                        INFRA_ERROR_CODES.DATABASE_GENERAL_ERROR,
                        `Database (${this._database}) Error`,
                        (e as any)?.message || undefined,
                    ),
                );
            }
        });
    }
}
