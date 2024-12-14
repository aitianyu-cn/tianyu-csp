/** @format */

import { DatabaseManager } from "#core/infra/DatabaseManager";
import { DATABASE_CONFIGS_MAP, DATABASE_TYPES_MAP } from "packages/Common";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.DatabaseManager", () => {
    const databaseMgr = new DatabaseManager({ dbTypes: DATABASE_TYPES_MAP, configMap: DATABASE_CONFIGS_MAP });

    it("databaseType", () => {
        const types = DATABASE_TYPES_MAP;
        for (const key of Object.keys(types)) {
            expect(databaseMgr.databaseType(key)).toEqual(types[key]);
        }
        expect(databaseMgr.databaseType("invalid_db")).toEqual("mysql");
    });

    describe("connect", () => {
        it("known db", () => {
            expect(() => {
                const connection = databaseMgr.connect(Object.keys(DATABASE_TYPES_MAP)[0]);
                connection.close();
            }).not.toThrow();
        });

        it("unknown db", () => {
            expect(() => {
                const connection = databaseMgr.connect("unknown_db");
                connection.close();
            }).not.toThrow();
        });
    });
});
