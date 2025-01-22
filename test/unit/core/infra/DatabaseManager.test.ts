/** @format */

import { DatabaseManager } from "#core/infra/DatabaseManager";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.DatabaseManager", () => {
    const databaseMgr = new DatabaseManager();

    describe("connect", () => {
        it("known db", () => {
            expect(() => {
                const connection = databaseMgr.connect("mysql", "", {});
                connection.close();
            }).not.toThrow();
        });

        it("unknown db", () => {
            expect(() => {
                const connection = databaseMgr.connect("mysql", "unknown_db", {});
                connection.close();
            }).not.toThrow();
        });

        it("invalid type", () => {
            expect(() => {
                databaseMgr.connect("redis" as any, "", {});
            }).toThrow();
        });
    });

    it("nosql", () => {
        expect(databaseMgr.nosql).toBeDefined();
    });
});
