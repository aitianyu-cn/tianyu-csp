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
});
