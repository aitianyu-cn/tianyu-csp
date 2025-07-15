/** @format */

import * as Handler from "#core/infra/code/AuditCode";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.AuditManager", () => {
    it("record to flush", (done) => {
        jest.spyOn(TIANYU.logger, "log").mockImplementation(() => Promise.resolve());
        jest.spyOn(Handler, "handleAuditRecord").mockImplementation(async () => {
            expect(TIANYU.logger.log).toHaveBeenCalledTimes(10);
            done();
        });

        for (let i = 0; i < 10; ++i) {
            TIANYU.audit.record("t", "t");
        }
    });
});
