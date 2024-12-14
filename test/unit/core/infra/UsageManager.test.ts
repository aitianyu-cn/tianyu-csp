/** @format */

import { UsageManager } from "#core/infra/UsageManager";
import { IDBConnection } from "#interface";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.UsageManager", () => {
    const usageMgr = new UsageManager();

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
        usageMgr.record("test", "module", "change").then(() => {
            expect(TIANYU.logger.error).toHaveBeenCalled();
            expect(connection.close).toHaveBeenCalled();
            done();
        }, done.fail);
    });

    it("trace success", (done) => {
        jest.spyOn(connection, "execute").mockReturnValue(Promise.resolve());
        jest.spyOn(connection, "close");
        usageMgr.record("test", "module", "change", "msg").then(() => {
            expect(TIANYU.logger.error).not.toHaveBeenCalled();
            expect(connection.close).toHaveBeenCalled();
            done();
        }, done.fail);
    });
});
