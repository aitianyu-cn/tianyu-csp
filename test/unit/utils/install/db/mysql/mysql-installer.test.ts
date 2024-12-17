/** @format */

import { MysqlService } from "#core/infra/db/MysqlService";
import { IDatabaseInstallConfig } from "#interface";
import { ConfigProcessor } from "#utils/install/db/config-processor";
import { Schema } from "#utils/install/db/mysql/schema";
import { Table } from "#utils/install/db/mysql/table";

import * as HANDLER from "#utils/install/db/mysql/handler";
import { DatabaseProcessor } from "#utils/install/db/database-processor-export";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.install.db.mysql.mysql-installer", () => {
    let DB_EXECUTE_SPYON: jest.SpyInstance;
    let DB_QUERY_SPYON: jest.SpyInstance;
    let DB_CLOSE_SPYON: jest.SpyInstance;

    const filterForMysql = (): IDatabaseInstallConfig => {
        const config = ConfigProcessor.fromConfig();
        return config["mysql"] || {};
    };

    const config = filterForMysql();

    beforeEach(() => {
        DB_EXECUTE_SPYON = jest.spyOn(MysqlService.prototype, "execute");
        DB_QUERY_SPYON = jest.spyOn(MysqlService.prototype, "query");
        DB_CLOSE_SPYON = jest.spyOn(MysqlService.prototype, "close");
    });

    describe("mysqlCreator", () => {
        it("query failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("failed"));
            jest.spyOn(Schema, "create");

            DatabaseProcessor["mysql"].creator(config, true).then((value) => {
                expect(value).toBeFalsy();
                expect(Schema.create).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("drop database failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(false));
            jest.spyOn(Schema, "create");

            DatabaseProcessor["mysql"].creator(config, true).then((value) => {
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

            DatabaseProcessor["mysql"].creator(config, true).then((value) => {
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

            DatabaseProcessor["mysql"].creator(config, true).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("success", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(true));

            DatabaseProcessor["mysql"].creator(config, true).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("mysqlDestroyer", () => {
        it("handle failed", (done) => {
            jest.spyOn(HANDLER, "handleSchemaDrop").mockImplementation(() => Promise.resolve(false));

            DatabaseProcessor["mysql"].destroyer(config).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("handle success", (done) => {
            jest.spyOn(HANDLER, "handleSchemaDrop").mockImplementation(() => Promise.resolve(true));

            DatabaseProcessor["mysql"].destroyer(config).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("mysqlCleaner", () => {
        it("handle failed", (done) => {
            jest.spyOn(HANDLER, "handleSchemaClean").mockImplementation(() => Promise.resolve(false));

            DatabaseProcessor["mysql"].cleaner(config).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("handle success", (done) => {
            jest.spyOn(HANDLER, "handleSchemaClean").mockImplementation(() => Promise.resolve(true));

            DatabaseProcessor["mysql"].cleaner(config).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("mysqlInserter", () => {
        it("handle failed", (done) => {
            jest.spyOn(HANDLER, "handleSchemaInsert").mockImplementation(() => Promise.resolve(false));

            DatabaseProcessor["mysql"].inserter(config).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("handle success", (done) => {
            jest.spyOn(HANDLER, "handleSchemaInsert").mockImplementation(() => Promise.resolve(true));

            DatabaseProcessor["mysql"].inserter(config).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });
});
