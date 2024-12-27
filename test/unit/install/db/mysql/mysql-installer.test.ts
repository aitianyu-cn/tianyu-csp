/** @format */

import { MysqlService } from "#core/infra/db/MysqlService";
import { SqlConfigProcessor } from "#install/db/processor/sql-config-processor";
import { Schema } from "#install/db/mysql/schema";
import { Table } from "#install/db/mysql/table";

import * as HANDLER from "#install/db/mysql/handler";
import { DatabaseExecutor } from "#install/db/database-processor-export";

describe("aitianyu-cn.node-module.tianyu-csp.unit.install.db.mysql.mysql-installer", () => {
    let DB_EXECUTE_SPYON: jest.SpyInstance;
    let DB_QUERY_SPYON: jest.SpyInstance;
    let DB_CLOSE_SPYON: jest.SpyInstance;

    const config = SqlConfigProcessor.process(
        {
            csp_sys: {
                type: "mysql",
                config: {
                    host: "server.tencent.backend.aitianyu.cn",
                    port: 3306,
                    user: "root",
                    password: "ysy1998ysy[]",
                },
            },
        },
        [
            {
                database: "csp_sys",
                table: "logger",
                field: {
                    user: { name: "user", type: "char", size: 45 },
                    level: { name: "level", type: "tinyint", size: 3, default: "0" },
                    time: { name: "time", type: "char", size: 45 },
                    msg: { name: "msg", type: "text" },
                },
            },
        ],
    )["mysql"];

    beforeEach(() => {
        DB_EXECUTE_SPYON = jest.spyOn(MysqlService.prototype, "execute");
        DB_QUERY_SPYON = jest.spyOn(MysqlService.prototype, "query");
        DB_CLOSE_SPYON = jest.spyOn(MysqlService.prototype, "close");
    });

    describe("mysqlCreator", () => {
        it("query failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("failed"));
            jest.spyOn(Schema, "create");

            DatabaseExecutor["mysql"].creator(config, true).then((value) => {
                expect(value).toBeFalsy();
                expect(Schema.create).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("drop database failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(false));
            jest.spyOn(Schema, "create");

            DatabaseExecutor["mysql"].creator(config, true).then((value) => {
                expect(value).toBeFalsy();
                expect(Schema.create).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("create database failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(false));
            jest.spyOn(Table, "create");

            DatabaseExecutor["mysql"].creator(config, true).then((value) => {
                expect(value).toBeFalsy();
                expect(Table.create).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("create table failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(false));

            DatabaseExecutor["mysql"].creator(config, true).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("success", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(true));

            DatabaseExecutor["mysql"].creator(config, true).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("mysqlDestroyer", () => {
        it("handle failed", (done) => {
            jest.spyOn(HANDLER, "handleSchemaDrop").mockImplementation(() => Promise.resolve(false));

            DatabaseExecutor["mysql"].destroyer(config).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("handle success", (done) => {
            jest.spyOn(HANDLER, "handleSchemaDrop").mockImplementation(() => Promise.resolve(true));

            DatabaseExecutor["mysql"].destroyer(config).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("mysqlCleaner", () => {
        it("handle failed", (done) => {
            jest.spyOn(HANDLER, "handleSchemaClean").mockImplementation(() => Promise.resolve(false));

            DatabaseExecutor["mysql"].cleaner(config).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("handle success", (done) => {
            jest.spyOn(HANDLER, "handleSchemaClean").mockImplementation(() => Promise.resolve(true));

            DatabaseExecutor["mysql"].cleaner(config).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("mysqlInserter", () => {
        it("handle failed", (done) => {
            jest.spyOn(HANDLER, "handleSchemaInsert").mockImplementation(() => Promise.resolve(false));

            DatabaseExecutor["mysql"].inserter(config).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("handle success", (done) => {
            jest.spyOn(HANDLER, "handleSchemaInsert").mockImplementation(() => Promise.resolve(true));

            DatabaseExecutor["mysql"].inserter(config).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });
});
