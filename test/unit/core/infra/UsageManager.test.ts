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
        done();
    });
});
