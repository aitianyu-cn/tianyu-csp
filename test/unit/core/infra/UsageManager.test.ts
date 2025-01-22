/** @format */

import { UsageManager } from "#core/infra/UsageManager";
import * as XCALL from "#core/infra/code/GenericXcall";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.UsageManager", () => {
    const usageMgr = new UsageManager();

    it("record with not message", async () => {
        jest.spyOn(XCALL, "doXcall").mockImplementation(() => Promise.resolve());

        await usageMgr.record("test", "module", "read");

        expect(XCALL.doXcall).toHaveBeenCalled();
    });

    it("record with message", async () => {
        jest.spyOn(XCALL, "doXcall").mockImplementation(() => Promise.resolve());

        await usageMgr.record("test", "module", "read", "message");

        expect(XCALL.doXcall).toHaveBeenCalled();
    });
});
