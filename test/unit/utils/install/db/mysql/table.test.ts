/** @format */

import { Table } from "#utils/install/db/mysql/table";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.install.db.mysql.Table", () => {
    describe("create", () => {
        it("empty table", (done) => {
            const connect: any = {
                execute: () => Promise.resolve(),
            };

            jest.spyOn(connect, "execute");

            Table.create(connect, "", "", { fields: [] }).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });

        it("execute failed", (done) => {
            const connect: any = {
                execute: () => Promise.reject(),
            };

            jest.spyOn(connect, "execute");

            Table.create(connect, "", "", {
                fields: [
                    {
                        type: "bigint",
                        name: "t",
                    },
                ],
            }).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("success", (done) => {
            const connect: any = {
                execute: () => Promise.resolve(),
            };

            jest.spyOn(connect, "execute");

            Table.create(connect, "", "", {
                fields: [
                    {
                        type: "bigint",
                        name: "t",
                    },
                ],
            }).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("exist", () => {
        it("query error", (done) => {
            const connect: any = {
                query: () => Promise.reject(),
            };

            Table.exist(connect, "", "").then((value) => {
                expect(value).toEqual("failed");
                done();
            }, done.fail);
        });

        it("exist", (done) => {
            const connect: any = {
                query: () => Promise.resolve([{}]),
            };

            Table.exist(connect, "", "").then((value) => {
                expect(value).toEqual("exist");
                done();
            }, done.fail);
        });

        it("unexist", (done) => {
            const connect: any = {
                query: () => Promise.resolve([]),
            };

            Table.exist(connect, "", "").then((value) => {
                expect(value).toEqual("unexist");
                done();
            }, done.fail);
        });
    });

    describe("clean", () => {
        it("query error", (done) => {
            const connect: any = {
                execute: () => Promise.reject(),
            };

            Table.clean(connect, "", "").then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("success", (done) => {
            const connect: any = {
                execute: () => Promise.resolve([{}]),
            };

            Table.clean(connect, "", "").then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("insert", () => {
        it("no sqls", (done) => {
            const connect: any = {
                executeBatch: () => Promise.resolve(),
            };

            jest.spyOn(connect, "executeBatch");

            Table.insert(connect, "", "", []).then((value) => {
                expect(value).toBeTruthy();
                expect(connect.executeBatch).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("query error", (done) => {
            const connect: any = {
                executeBatch: () => Promise.reject(),
            };

            Table.insert(connect, "", "", [""]).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("success", (done) => {
            const connect: any = {
                executeBatch: () => Promise.resolve([{}]),
            };

            Table.insert(connect, "", "", [""]).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });
});
