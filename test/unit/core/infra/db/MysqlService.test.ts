/** @format */

import * as mysql from "mysql";
import { INFRA_ERROR_CODES } from "#core/Constant";
import { MysqlService } from "#core/infra/db/MysqlService";
import { OperationError } from "#interface";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.db.MysqlService", () => {
    const databaseConfig = {
        host: "server.tencent.backend.aitianyu.cn",
        port: 3306,
        user: "root",
        password: "ysy1998ysy[]",
    };
    const databaseName = "test_db";

    const service = new MysqlService(databaseName, databaseConfig);

    afterAll(() => {
        service.close();
    });

    it("name", () => {
        expect(service.name).toEqual(databaseName);
    });

    describe("_getConnection", () => {
        it("error in get connection", (done) => {
            jest.spyOn(service["_pool"], "getConnection").mockImplementation(() => {
                throw new Error("test_error");
            });

            (service as any)._getConnection().then(done.fail, (error: OperationError) => {
                expect(error.code).toEqual(INFRA_ERROR_CODES.DATABASE_GENERAL_ERROR);
                expect(error.message).toEqual(`Database (${databaseName}) Error`);
                expect(error.error).toEqual("test_error");
                done();
            });
        });

        it("error when create connection", (done) => {
            jest.spyOn(service["_pool"], "getConnection").mockImplementation((callback) => {
                callback(
                    { message: "test_error" } as any,
                    {
                        destroy: () => {},
                    } as any,
                );
            });

            (service as any)._getConnection().then(done.fail, (error: OperationError) => {
                expect(error.code).toEqual(INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR);
                expect(error.message).toEqual(`Database (${databaseName}) Connection Create Failed`);
                expect(error.error).toEqual("test_error");
                done();
            });
        });

        it("success", (done) => {
            (service as any)._getConnection().then((connection: mysql.PoolConnection) => {
                expect(!!connection.threadId).toBeTruthy();
                connection.destroy();
                done();
            }, done.fail);
        }, 50000);
    });

    describe("execute", () => {
        it("no sql", async () => {
            const getConnection = jest.spyOn(service as any, "_getConnection");

            await service.execute("");

            expect(getConnection).not.toHaveBeenCalled();
        });

        it("sql execute with error", (done) => {
            jest.spyOn(service as any, "_getConnection").mockReturnValue({
                query: (_sql: string, callback: (error: mysql.MysqlError | null) => void) => {
                    callback({ message: "test_error" } as any);
                },
                release: () => undefined,
            });

            service.execute("sql").then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.code).toEqual(INFRA_ERROR_CODES.DATABASE_QUERY_EXECUTION_ERROR);
                    expect(error.message).toEqual(`Database (${databaseName}) Query ("sql") Execution Failed`);
                    expect(error.error).toEqual("test_error");
                    done();
                },
            );
        });

        it("sql execute success", (done) => {
            jest.spyOn(service as any, "_getConnection").mockReturnValue({
                query: (_sql: string, callback: (error: mysql.MysqlError | null) => void) => {
                    callback(null);
                },
                release: () => undefined,
            });

            service.execute("sql").then(done, done.fail);
        });
    });

    describe("executeBatch", () => {
        it("no sql", async () => {
            const getConnection = jest.spyOn(service as any, "_getConnection");

            await service.executeBatch([]);

            expect(getConnection).not.toHaveBeenCalled();
        });

        it("start transaction failed", (done) => {
            jest.spyOn(service as any, "_getConnection").mockReturnValue({
                query: (_sql: string, callback: (error: mysql.MysqlError | null) => void) => {
                    callback(null);
                },
                beginTransaction: (callback: (transactionError: mysql.MysqlError | null) => void) => {
                    callback({ message: "test_error" } as any);
                },
                release: () => undefined,
                threadId: 1,
            });

            service.executeBatch(["sql"]).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.code).toEqual(INFRA_ERROR_CODES.DATABASE_QUERY_TRANSACTION_ERROR);
                    expect(error.message).toEqual(`Database (${databaseName}) Transaction Operation Failed`);
                    expect(error.error).toEqual("test_error");
                    done();
                },
            );
        });

        it("start transaction contains error, should rollback", (done) => {
            const connection = {
                query: (sql: string, callback: (error: mysql.MysqlError | null) => void) => {
                    if (sql.startsWith("error")) {
                        callback({ message: "test_error" } as any);
                    } else {
                        callback(null);
                    }
                },
                beginTransaction: (callback: (transactionError: mysql.MysqlError | null) => void) => {
                    callback(null);
                },
                rollback: () => undefined,
                release: () => undefined,
                threadId: 1,
            };
            jest.spyOn(connection, "rollback");
            jest.spyOn(service as any, "_getConnection").mockReturnValue(connection);

            service.executeBatch(["sql", "error1", "sql", "error2"]).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(connection.rollback).toHaveBeenCalled();

                    expect(error.code).toEqual(INFRA_ERROR_CODES.DATABASE_BATCH_QUERY_EXECUTION_ERROR);
                    expect(error.message).toEqual(`Database (${databaseName}) Transaction Query Execution Failed`);
                    done();
                },
            );
        });

        it("start transaction success", (done) => {
            const connection = {
                query: (_sql: string, callback: (error: mysql.MysqlError | null) => void) => {
                    callback(null);
                },
                beginTransaction: (callback: (transactionError: mysql.MysqlError | null) => void) => {
                    callback(null);
                },
                rollback: () => undefined,
                commit: () => undefined,
                release: () => undefined,
                threadId: 1,
            };
            jest.spyOn(connection, "commit");
            jest.spyOn(connection, "rollback");
            jest.spyOn(service as any, "_getConnection").mockReturnValue(connection);

            service.executeBatch(["sql", "error1", "sql", "error2"]).then(() => {
                expect(connection.commit).toHaveBeenCalled();
                expect(connection.rollback).not.toHaveBeenCalled();

                done();
            }, done.fail);
        });
    });

    describe("query", () => {
        it("no sql", async () => {
            const getConnection = jest.spyOn(service as any, "_getConnection");

            await service.query("");

            expect(getConnection).not.toHaveBeenCalled();
        });

        it("sql execute with error", (done) => {
            jest.spyOn(service as any, "_getConnection").mockReturnValue({
                query: (_sql: string, callback: (error: mysql.MysqlError | null) => void) => {
                    callback({ message: "test_error" } as any);
                },
                release: () => undefined,
            });

            service.query("sql").then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.code).toEqual(INFRA_ERROR_CODES.DATABASE_QUERY_EXECUTION_ERROR);
                    expect(error.message).toEqual(`Database (${databaseName}) Query ("sql") Execution Failed`);
                    expect(error.error).toEqual("test_error");
                    done();
                },
            );
        });

        it("sql execute success", (done) => {
            jest.spyOn(service as any, "_getConnection").mockReturnValue({
                query: (_sql: string, callback: (error: mysql.MysqlError | null, result: any) => void) => {
                    callback(null, [{ a: "1" }, { a: "2" }]);
                },
                release: () => undefined,
            });

            service.query("sql").then((result) => {
                expect(Array.isArray(result)).toBeTruthy();
                expect(result[0].a).toEqual("1");
                expect(result[1].a).toEqual("2");
                done();
            }, done.fail);
        });
    });
});
