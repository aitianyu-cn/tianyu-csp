/** @format */

import { Schema } from "#utils/install/db/mysql/schema";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.install.db.mysql.Schema", () => {
    describe("exist", () => {
        it("query error", (done) => {
            const connect: any = {
                query: () => Promise.reject(),
            };

            Schema.exist(connect, "").then((value) => {
                expect(value).toEqual("failed");
                done();
            }, done.fail);
        });

        it("exist", (done) => {
            const connect: any = {
                query: () => Promise.resolve([{}]),
            };

            Schema.exist(connect, "").then((value) => {
                expect(value).toEqual("exist");
                done();
            }, done.fail);
        });

        it("unexist", (done) => {
            const connect: any = {
                query: () => Promise.resolve([]),
            };

            Schema.exist(connect, "").then((value) => {
                expect(value).toEqual("unexist");
                done();
            }, done.fail);
        });
    });

    describe("drop", () => {
        it("query error", (done) => {
            const connect: any = {
                execute: () => Promise.reject(),
            };

            Schema.drop(connect, "").then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("success", (done) => {
            const connect: any = {
                execute: () => Promise.resolve(),
            };

            Schema.drop(connect, "").then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    describe("create", () => {
        it("query error", (done) => {
            const connect: any = {
                execute: () => Promise.reject(),
            };

            Schema.create(connect, "").then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("success", (done) => {
            const connect: any = {
                execute: () => Promise.resolve(),
            };

            Schema.create(connect, "").then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });
    });
});
