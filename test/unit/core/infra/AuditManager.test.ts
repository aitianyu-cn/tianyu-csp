/** @format */

import * as Handler from "#core/infra/code/AuditCode";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.AuditManager", () => {
    it("record to flush", (done) => {
        const SPY = jest.spyOn(TIANYU.logger, "log").mockImplementation(async () => Promise.resolve());
        jest.spyOn(Handler, "handleAuditRecord").mockImplementation(async () => {
            expect(SPY).toHaveBeenCalledTimes(10);
            done();
        });

        for (let i = 0; i < 10; ++i) {
            void TIANYU.audit.record("t", "t");
        }
    });
});
