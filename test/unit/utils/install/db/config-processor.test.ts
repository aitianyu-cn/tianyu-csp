/** @format */

import { SupportedDatabaseType, IDatabaseConnectionConfig } from "#interface";
import { ConfigProcessor } from "#utils/install/db/config-processor";
import { DATABASE_CONFIGS_MAP, DATABASE_SYS_DB_MAP, DATABASE_TYPES_MAP } from "packages/Common";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.install.db.ConfigProcessor", () => {
    describe("process", () => {
        it("all tests", () => {
            const TEST_CONFIG = require("../../../../content/db/db-config-test");

            const result = ConfigProcessor.process(TEST_CONFIG.DBConfigs, TEST_CONFIG.DBTables);

            expect(result["mysql"]).toBeDefined();

            expect(result["mysql"]["csp_user"]).toBeDefined();
            expect(result["mysql"]["csp_sys"]).toBeDefined();

            expect(result["mysql"]["csp_user"].tables["user_tb"]).toBeDefined();
            expect(result["mysql"]["csp_sys"].tables["feature"]).toBeDefined();

            expect(result["mysql"]["csp_user"].tables["user_tb"].data.length).toEqual(1);
            expect(result["mysql"]["csp_sys"].tables["feature"].data.length).toEqual(1);
        }, 5000000);
    });
});
