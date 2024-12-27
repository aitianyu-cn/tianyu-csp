/** @format */

import { INFRA_ERROR_CODES } from "#core/Constant";
import { NosqlDatabaseManager } from "#core/infra/db/NosqlDatabaseManager";
import { DBHelper } from "#utils/DBHelper";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.db.NosqlDatabaseManager", () => {
    const mgr = new NosqlDatabaseManager();

    describe("redis", () => {
        beforeEach(() => {
            jest.spyOn(DBHelper.converter, "redis");
        });

        it("no database", () => {
            try {
                mgr.redis("");
            } catch (e: any) {
                expect(e.code).toEqual(INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR);
            }

            expect(DBHelper.converter.redis).not.toHaveBeenCalled();
        });

        it("no config", () => {
            try {
                mgr.redis("test_0");
            } catch (e: any) {
                expect(e.code).toEqual(INFRA_ERROR_CODES.DATABASE_CONNECTION_CREATION_ERROR);
            }

            expect(DBHelper.converter.redis).not.toHaveBeenCalled();
        });

        it("success", () => {
            expect(() => {
                const redis = mgr.redis("test_0", {});
                redis.disconnect();
            }).not.toThrow();

            expect(DBHelper.converter.redis).toHaveBeenCalled();
        });
    });
});
