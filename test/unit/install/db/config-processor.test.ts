/** @format */

import { SqlConfigProcessor } from "#install/db/processor/sql-config-processor";

describe("aitianyu-cn.node-module.tianyu-csp.unit.install.db.ConfigProcessor", () => {
    describe("process", () => {
        it("all tests", () => {
            const TEST_CONFIG = require("../../../content/db/db-config-test");

            const result = SqlConfigProcessor.process(TEST_CONFIG.DBConfigs, TEST_CONFIG.DBTables);

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
