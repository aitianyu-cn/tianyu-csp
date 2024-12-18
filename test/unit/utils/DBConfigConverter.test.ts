/** @format */

import { IDatabaseConnectionConfig } from "#interface";
import { DBConfigConverter } from "#utils/db/DBConfigConverter";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.DBConfigConverter", () => {
    describe("toMysql", () => {
        it("-", () => {
            const config: IDatabaseConnectionConfig = {
                host: "localhost",
                port: 3306,
                user: "test",
                password: "test",
                timeout: 3000,
            };
            const configForMysql = DBConfigConverter.toMysql(config);

            expect(configForMysql).toEqual(config);
        });
    });
});
