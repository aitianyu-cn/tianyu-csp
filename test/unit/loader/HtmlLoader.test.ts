/** @format */

import { html } from "packages/default-loader";

describe("aitianyu-cn.node-module.tianyu-csp.unit.loader.HtmlLoader", () => {
    it("loader", async () => {
        const data = await html();
        expect(data.body.includes("tianyu_shell_root")).toBeTruthy();
    });
});
