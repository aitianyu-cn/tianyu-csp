/** @format */

import { handleSchema, handleSchemaClean, handleSchemaDrop, handleSchemaInsert } from "#install/db/mysql/handler";
import { Schema } from "#install/db/mysql/schema";
import { Table } from "#install/db/mysql/table";

describe("aitianyu-cn.node-module.tianyu-csp.unit.install.db.mysql.handler", () => {
    describe("handleSchema", () => {
        it("status query failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("failed"));
            jest.spyOn(Schema, "drop");
            jest.spyOn(Schema, "create");

            handleSchema({} as any, "", {}, true).then((value) => {
                expect(value).toBeFalsy();
                expect(Schema.drop).not.toHaveBeenCalled();
                expect(Schema.create).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("drop schema failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(false));
            jest.spyOn(Schema, "create");

            handleSchema({} as any, "", {}, true).then((value) => {
                expect(value).toBeFalsy();
                expect(Schema.create).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("create database & force drop", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(true));

            handleSchema({} as any, "", {}, true).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });

        it("create database if not exist", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("unexist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(true));

            handleSchema({} as any, "", {}, false).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });

        it("create database failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("unexist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(false));
            jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(true));

            handleSchema({} as any, "", {}, false).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("create table failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("unexist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(false));

            handleSchema({} as any, "", { table_a: { fields: [], data: [] } }, false).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("create table success", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("unexist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Schema, "create").mockImplementation(() => Promise.resolve(true));
            jest.spyOn(Table, "create").mockImplementation(() => Promise.resolve(true));

            handleSchema({} as any, "", {}, false).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("handleSchemaDrop", () => {
        it("status query failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("failed"));
            jest.spyOn(Schema, "drop");

            handleSchemaDrop({} as any, "").then((value) => {
                expect(value).toBeFalsy();
                expect(Schema.drop).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("drop schema failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(false));

            handleSchemaDrop({} as any, "").then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("drop schema success", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Schema, "drop").mockImplementation(() => Promise.resolve(true));

            handleSchemaDrop({} as any, "").then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("handleSchemaClean", () => {
        it("status query failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("failed"));
            jest.spyOn(Table, "exist");

            handleSchemaClean({} as any, "", {}).then((value) => {
                expect(value).toBeFalsy();
                expect(Table.exist).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("database not exist", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("unexist"));
            jest.spyOn(Table, "exist");

            handleSchemaClean({} as any, "", {}).then((value) => {
                expect(value).toBeFalsy();
                expect(Table.exist).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("query table failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "exist").mockImplementation(() => Promise.resolve("failed"));
            jest.spyOn(Table, "clean");

            handleSchemaClean({} as any, "", { table_a: { fields: [], data: [] } }).then((value) => {
                expect(value).toBeFalsy();
                expect(Table.clean).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("clean table failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "clean").mockImplementation(() => Promise.resolve(false));

            handleSchemaClean({} as any, "", { table_a: { fields: [], data: [] } }).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("clean table success", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "clean").mockImplementation(() => Promise.resolve(true));

            handleSchemaClean({} as any, "", { table_a: { fields: [], data: [] } }).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });

        it("clean table success - table unexist", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "exist").mockImplementation(() => Promise.resolve("unexist"));
            jest.spyOn(Table, "clean").mockImplementation(() => Promise.resolve(true));

            handleSchemaClean({} as any, "", { table_a: { fields: [], data: [] } }).then((value) => {
                expect(value).toBeTruthy();
                expect(Table.clean).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });
    });

    describe("handleSchemaInsert", () => {
        it("status query failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("failed"));
            jest.spyOn(Table, "exist");

            handleSchemaInsert({} as any, "", {}).then((value) => {
                expect(value).toBeFalsy();
                expect(Table.exist).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("database not exist", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("unexist"));
            jest.spyOn(Table, "exist");

            handleSchemaInsert({} as any, "", {}).then((value) => {
                expect(value).toBeFalsy();
                expect(Table.exist).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("query table failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "exist").mockImplementation(() => Promise.resolve("failed"));
            jest.spyOn(Table, "insert");

            handleSchemaInsert({} as any, "", { table_a: { fields: [], data: [] } }).then((value) => {
                expect(value).toBeFalsy();
                expect(Table.insert).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("insert table failed", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "insert").mockImplementation(() => Promise.resolve(false));

            handleSchemaInsert({} as any, "", { table_a: { fields: [], data: [] } }).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("insert table success", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "insert").mockImplementation(() => Promise.resolve(true));

            handleSchemaInsert({} as any, "", { table_a: { fields: [], data: [] } }).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });

        it("insert table success - table unexist", (done) => {
            jest.spyOn(Schema, "exist").mockImplementation(() => Promise.resolve("exist"));
            jest.spyOn(Table, "exist").mockImplementation(() => Promise.resolve("unexist"));
            jest.spyOn(Table, "insert").mockImplementation(() => Promise.resolve(true));

            handleSchemaInsert({} as any, "", { table_a: { fields: [], data: [] } }).then((value) => {
                expect(value).toBeTruthy();
                expect(Table.insert).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });
    });
});
