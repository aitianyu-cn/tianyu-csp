/** @format */

import { ImportPackage } from "#interface";
import { PluginHandler } from "packages/utils/handler/PluginHandler";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.handler.PluginHandler", () => {
    it("test", async () => {
        const arr = [1, 2, 3, 4];
        const plugins: ImportPackage[] = [
            {
                package: "#",
                module: "plugin",
                method: "handle",
            },
        ];

        const result = await PluginHandler.handlePlguin(arr, plugins);
        expect(result).toEqual(["p1", "p2", "p3", "p4"]);
    });
});
