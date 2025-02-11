/** @format */

import { IDatabaseConnectionConfig } from "#interface";
import { DBHelper } from "#utils";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.db.DBHelper.converter", () => {
    describe("toMysql", () => {
        it("-", () => {
            const config: IDatabaseConnectionConfig = {
                host: "localhost",
                port: 3306,
                user: "test",
                password: "test",
                timeout: 3000,
            };
            const configForMysql = DBHelper.converter.mysql(config);

            expect(configForMysql).toEqual(config);
        });
    });

    describe("redis", () => {
        it("-", () => {
            const config: IDatabaseConnectionConfig = {
                host: "server",
                port: 3306,
                user: "test",
                password: "test",
                timeout: 3000,
            };
            const configForRedis = DBHelper.converter.redis(config, "test_1");

            expect(configForRedis.host).toEqual("server");
            expect(configForRedis.port).toEqual(3306);
            expect(configForRedis.username).toEqual("test");
            expect(configForRedis.password).toEqual("test");
            expect(configForRedis.commandTimeout).toEqual(3000);
            expect(configForRedis.db).toEqual(1);
        });

        it("default setting", () => {
            const config: IDatabaseConnectionConfig = {};
            const configForRedis = DBHelper.converter.redis(config, "test_1");

            expect(configForRedis.host).toEqual("localhost");
            expect(configForRedis.port).toEqual(6379);
            expect(configForRedis.username).toEqual("default");
            expect(configForRedis.db).toEqual(1);
        });
    });
});
