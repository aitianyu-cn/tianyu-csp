/** @format */

import { HTTP_STATUS_CODE } from "#interface";
import { fileLoader, internalLoader } from "#loader/FileLoader";
import { file } from "packages/default-loader";
import path from "path";

describe("aitianyu-cn.node-module.tianyu-csp.unit.loader.FileLoader", () => {
    it("loader", async () => {
        const data = await file();
        expect(data.statusCode).toEqual(HTTP_STATUS_CODE.TEMPORARY_REDIRECT);
        expect(data.headers["Location"]).not.toEqual("");
    });

    it("loader when file not exist", () => {
        const data = fileLoader("");
        expect(data).toBeNull();
    });

    it("loader file of known type", () => {
        const data = internalLoader(path.join(process.cwd(), "scripts/data", "/welcome/css/test.css"));
        expect(data?.headers["Content-Type"]).toEqual("text/css");
    });

    it("loader file of unknown type", () => {
        const data = internalLoader(path.join(process.cwd(), "scripts/data", "/welcome/unknown.a"));
        expect(data?.headers["Content-Type"]).toEqual("application/a");
    });

    it("loader file of binary type", () => {
        const data = internalLoader(path.join(process.cwd(), "scripts/data", "/welcome/index_favicon.ico"));
        expect(data?.headers["Content-Type"]).toEqual("image/x-icon");
        expect(data?.binary).toBeTruthy();
    });

    it("loader file of no ext-type", () => {
        const data = internalLoader(path.join(process.cwd(), "scripts/data", "/welcome/no_ext"));
        expect(data?.headers["Content-Type"]).toEqual("application/text");
    });
});
