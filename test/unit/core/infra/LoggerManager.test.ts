/** @format */

import { IDBConnection } from "#interface";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.LoggerManager", () => {
    const connection: IDBConnection = {
        name: "",
        execute: async (_sql: string) => Promise.resolve(),
        executeBatch: async (_sqls: string[]) => Promise.resolve(),
        query: async (_sql: string) => Promise.resolve([]),
        close: () => undefined,
    };
    beforeEach(() => {
        jest.spyOn(TIANYU.db, "connect").mockReturnValue(connection);
    });

    describe("success case", () => {
        beforeEach(() => {
            jest.spyOn(connection, "execute").mockReturnValue(Promise.resolve());
            jest.spyOn(connection, "close");
        });

        it("log", (done) => {
            TIANYU.logger.log("test").then(() => {
                expect(connection.execute).toHaveBeenCalled();
                expect(connection.close).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("info", (done) => {
            TIANYU.logger.info("test").then(() => {
                expect(connection.execute).toHaveBeenCalled();
                expect(connection.close).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("warn", (done) => {
            TIANYU.logger.warn("test").then(() => {
                expect(connection.execute).toHaveBeenCalled();
                expect(connection.close).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("debug", (done) => {
            TIANYU.logger.debug("test").then(() => {
                expect(connection.execute).toHaveBeenCalled();
                expect(connection.close).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("error", (done) => {
            TIANYU.logger.error("test").then(() => {
                expect(connection.execute).toHaveBeenCalled();
                expect(connection.close).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("fatal", (done) => {
            TIANYU.logger.fatal("test").then(() => {
                expect(connection.execute).toHaveBeenCalled();
                expect(connection.close).toHaveBeenCalled();
                done();
            }, done.fail);
        });
    });

    it("exception case", (done) => {
        jest.spyOn(connection, "execute").mockReturnValue(Promise.reject());
        jest.spyOn(connection, "close");
        TIANYU.logger.fatal("test").then(() => {
            expect(connection.execute).toHaveBeenCalled();
            expect(connection.close).toHaveBeenCalled();
            done();
        }, done.fail);
    });
});
