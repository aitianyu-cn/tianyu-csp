/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.ImporterManager", () => {
    describe("import", () => {
        it("no package name", () => {
            try {
                TIANYU.import("", "");
                expect(true).toBeFalsy();
            } catch (e: any) {
                expect(e.code).toEqual(SERVICE_ERROR_CODES.INTERNAL_ERROR);
                expect(e.message).toEqual(`import package and Object should not be empty`);
            }
        });

        it("import object not exist", () => {
            const packageName = "#";
            const objectName = "Common";

            try {
                TIANYU.import(packageName, objectName);
                expect(true).toBeFalsy();
            } catch (e: any) {
                expect(e.code).toEqual(SERVICE_ERROR_CODES.INTERNAL_ERROR);
            }
        });

        it("import internal object", () => {
            const packageName = "$";
            const objectName = "Common";

            expect(() => {
                const module = TIANYU.import(packageName, objectName);
                expect(module).toBeDefined();
            }).not.toThrow();
        });

        it("import external object", () => {
            const packageName = "test";
            const objectName = "TestObj";

            expect(() => {
                const module = TIANYU.import(packageName, objectName);
                expect(module).toBeDefined();
                expect(module.MODULE_ID).toEqual("scripts.test.TestObj");
            }).not.toThrow();
        });
    });

    describe("html", () => {
        it("no file provided", () => {
            const html = TIANYU.import.html("");
            expect(html).toEqual("");
        });

        it("file not exist", () => {
            const html = TIANYU.import.html("data/noexist");
            expect(html).toEqual(`<!DOCTYPE html><html lang="en"><head></head><body></body></html>`);
        });

        it("get file with file name", () => {
            const html = TIANYU.import.html("data/index");
            expect(html.includes("tianyu_shell_root")).toBeTruthy();
        });

        it("get file by path - get default index file", () => {
            const html = TIANYU.import.html("data");
            expect(html.includes("tianyu_shell_root")).toBeTruthy();
        });
    });
});
