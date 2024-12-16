/** @format */

import { IDatabaseInstallConfig } from "#interface";
import { ConfigProcessor } from "#utils/install/db/config-processor";
import { Schema as MysqlSchemaHandler } from "#utils/install/db/mysql/schema";
import { handleConfig } from "#utils/install/installer";
import { MapOfType } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.install.installer", () => {
    describe("handleConfig", () => {
        it("no config", (done) => {
            handleConfig({}).then((value) => {
                expect(value).toBeTruthy();
                done();
            }, done.fail);
        });

        it("db not supported", (done) => {
            const config: MapOfType<IDatabaseInstallConfig> = {
                no_db: {},
            };

            handleConfig(config).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });

        it("installer run failed", (done) => {
            const config = ConfigProcessor.process();

            jest.spyOn(MysqlSchemaHandler, "exist").mockImplementation(() => Promise.resolve("failed"));

            handleConfig(config).then((value) => {
                expect(value).toBeFalsy();
                done();
            }, done.fail);
        });
    });
});
