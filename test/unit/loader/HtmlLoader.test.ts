/** @format */

import { HTTP_STATUS_CODE } from "#interface";
import { htmlLoader } from "#loader/HtmlLoader";
import { LOADER_IGNORE_PATTERN } from "packages/Common";
import { html } from "packages/default-loader";

describe("aitianyu-cn.node-module.tianyu-csp.unit.loader.HtmlLoader", () => {
    it("loader", async () => {
        const data = await html();
        expect(data.body.includes("tianyu_shell_root")).toBeTruthy();
    });

    it("loader when file not exist", () => {
        const data = htmlLoader("");
        expect(data.statusCode).toEqual(HTTP_STATUS_CODE.TEMPORARY_REDIRECT);
        expect(data.headers["Location"]).not.toEqual("");
    });

    it("url ignored", async () => {
        jest.spyOn(LOADER_IGNORE_PATTERN, "test").mockReturnValue(true);
        const data = await html();
        expect(data.statusCode).toEqual(HTTP_STATUS_CODE.TEMPORARY_REDIRECT);
        expect(data.headers["Location"]).not.toEqual("");
    });
});
