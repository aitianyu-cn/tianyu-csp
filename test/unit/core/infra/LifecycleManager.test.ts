/** @format */

import { LifecycleManager } from "#core/infra/LifecycleManager";
import { IReleasable } from "packages/interface/api/lifecycle";

class TestObj implements IReleasable {
    public id: string = "";
    async close(): Promise<void> {}
}

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.LifecycleManager", () => {
    it("join", () => {
        const mgr = new LifecycleManager();
        const ins = new TestObj();
        ins.id = "1";
        mgr.join(ins);

        expect(Object.keys(mgr["_instances"])).toEqual(["1"]);
    });

    it("join dup", () => {
        const mgr = new LifecycleManager();
        const ins1 = new TestObj();
        const ins2 = new TestObj();

        ins1.id = "1";
        ins2.id = "1";

        jest.spyOn(ins1, "close");

        mgr.join(ins1);
        mgr.join(ins2);

        expect(Object.keys(mgr["_instances"])).toEqual(["1"]);
        expect(ins1.close).toHaveBeenCalled();
    });

    it("leave", () => {
        const mgr = new LifecycleManager();

        const ins = new TestObj();
        ins.id = "1";
        mgr.join(ins);

        expect(Object.keys(mgr["_instances"])).toEqual(["1"]);

        expect(mgr.leave("1")).toBeDefined();
        expect(mgr.leave("1")).toBeNull();
    });

    it("recycle", async () => {
        const mgr = new LifecycleManager();
        const ins1 = new TestObj();
        ins1.id = "1";

        jest.spyOn(ins1, "close");

        mgr.join(ins1);

        expect(Object.keys(mgr["_instances"])).toEqual(["1"]);

        await mgr.recycle();

        expect(Object.keys(mgr["_instances"])).toEqual([]);
        expect(ins1.close).toHaveBeenCalled();
    });

    it("recycle with error", async () => {
        const mgr = new LifecycleManager();
        const ins1 = new TestObj();
        ins1.id = "1";

        jest.spyOn(TIANYU.audit, "error");
        jest.spyOn(ins1, "close").mockReturnValue(Promise.reject());

        mgr.join(ins1);

        expect(Object.keys(mgr["_instances"])).toEqual(["1"]);

        await mgr.recycle();

        expect(Object.keys(mgr["_instances"])).toEqual([]);
        expect(ins1.close).toHaveBeenCalled();
        expect(TIANYU.audit.error).toHaveBeenCalled();
    });
});
