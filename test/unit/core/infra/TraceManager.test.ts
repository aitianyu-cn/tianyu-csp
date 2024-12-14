/** @format */

import { TraceManager } from "#core/infra/TraceManager";
import { IDBConnection } from "#interface";
import { guid } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.TraceManager", () => {
    const traceMgr = new TraceManager();
    traceMgr.setId(guid());

    it("trace id", () => {
        expect(traceMgr.getId()).not.toEqual("");
    });

    describe("trace", () => {
        const connection: IDBConnection = {
            name: "",
            execute: async (_sql: string) => Promise.resolve(),
            executeBatch: async (_sqls: string[]) => Promise.resolve(),
            query: async (_sql: string) => Promise.resolve([]),
            close: () => undefined,
        };

        beforeEach(() => {
            jest.spyOn(TIANYU.logger, "error").mockReturnValue(Promise.resolve());
            jest.spyOn(TIANYU.db, "connect").mockReturnValue(connection);
        });

        it("trace with error", (done) => {
            jest.spyOn(connection, "execute").mockReturnValue(Promise.reject());
            jest.spyOn(connection, "close");
            traceMgr.trace("test").then(() => {
                expect(TIANYU.logger.error).toHaveBeenCalled();
                expect(connection.close).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("trace success", (done) => {
            jest.spyOn(connection, "execute").mockReturnValue(Promise.resolve());
            jest.spyOn(connection, "close");
            traceMgr.trace("test", "details", "core").then(() => {
                expect(TIANYU.logger.error).not.toHaveBeenCalled();
                expect(connection.close).toHaveBeenCalled();
                done();
            }, done.fail);
        });
    });
});
