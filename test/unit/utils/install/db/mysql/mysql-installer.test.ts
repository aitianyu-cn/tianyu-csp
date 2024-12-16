/** @format */

import { MysqlService } from "#core/infra/db/MysqlService";
import { IDatabaseInstallConfig } from "#interface";
import { ConfigProcessor } from "#utils/install/db/config-processor";
import { mysqlProcessor } from "#utils/install/db/mysql/mysql-installer";
import { Schema } from "#utils/install/db/mysql/schema";
import { Table } from "#utils/install/db/mysql/table";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.install.db.mysql.mysql-installer", () => {
    let DB_EXECUTE_SPYON: jest.SpyInstance;
    let DB_QUERY_SPYON: jest.SpyInstance;
    let DB_CLOSE_SPYON: jest.SpyInstance;

    const filterForMysql = (): IDatabaseInstallConfig => {
        const config = ConfigProcessor.process();
        return config["mysql"] || {};
    };

    const config = filterForMysql();

    beforeEach(() => {
        DB_EXECUTE_SPYON = jest.spyOn(MysqlService.prototype, "execute");
        DB_QUERY_SPYON = jest.spyOn(MysqlService.prototype, "query");
        DB_CLOSE_SPYON = jest.spyOn(MysqlService.prototype, "close");
    });

    // DB_EXECUTE_SPYON.mockImplementation(() => Promise.reject());
    //     DB_QUERY_SPYON.mockImplementation(() => Promise.reject());

    it("query failed", (done) => {
        jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("failed"));
        jest.spyOn(Schema, "create");

        mysqlProcessor(config).then((value) => {
            expect(value).toBeFalsy();
            expect(Schema.create).not.toHaveBeenCalled();
            done();
        }, done.fail);
    });

    it("drop database failed", (done) => {
        jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
        jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(false));
        jest.spyOn(Schema, "create");

        mysqlProcessor(config).then((value) => {
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

        mysqlProcessor(config).then((value) => {
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

        mysqlProcessor(config).then((value) => {
            expect(value).toBeFalsy();
            done();
        }, done.fail);
    });

    it("success", (done) => {
        jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
        jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
        jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(true));
        jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(true));

        mysqlProcessor(config).then((value) => {
            expect(value).toBeTruthy();
            done();
        }, done.fail);
    });
});
