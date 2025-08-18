/** @format */

import { ImportCache } from "#core/infra/tools/ImporterCache";
import { TimerTools } from "test/tools/TimerTools";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.tools.ImportCache", () => {
    it("test case 1", () => {
        const cache = new ImportCache();

        expect(cache.get("a1", "a2")).toEqual("");

        cache.cache("a1", "a2", "p1");
        expect(cache.get("a1", "a2")).toEqual("p1");

        cache.remove("a1", "a2");
        expect(cache.get("a1", "a2")).toEqual("");
    });

    it("test case 2", async () => {
        const cache = new ImportCache({ timeout: 10 });

        cache.cache("a1", "a2", "p1");
        expect(cache.get("a1", "a2")).toEqual("p1");

        await TimerTools.sleep(30);

        expect(cache.get("a1", "a2")).toEqual("");
    }, 5000);
});
