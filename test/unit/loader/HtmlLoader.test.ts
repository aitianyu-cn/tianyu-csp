/** @format */

import * as HTML_LOADER from "#loader/HtmlLoader";

describe("aitianyu-cn.node-module.tianyu-csp.unit.loader.HtmlLoader", () => {
    it("loader", () => {
        const data = HTML_LOADER.loader();
        expect(data.body.includes("tianyu_shell_root")).toBeTruthy();
    });
});
