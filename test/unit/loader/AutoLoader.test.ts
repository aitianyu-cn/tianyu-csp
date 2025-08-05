/** @format */

import * as FileLoader from "#loader/FileLoader";
import { auto } from "packages/default-loader";

describe("aitianyu-cn.node-module.tianyu-csp.unit.loader.FileLoader", () => {
    it("loader is html", async () => {
        const data = await auto();
        expect(data.body.includes("tianyu_shell_root")).toBeTruthy();
    });

    it("loader is file", async () => {
        jest.spyOn(FileLoader, "fileLoader").mockReturnValue({
            statusCode: 1,
            headers: { "Content-Type": "text/html" },
            body: "response",
        });

        const data = await auto();
        expect(data.body).toEqual("response");
        expect(data.headers["Content-Type"]).toEqual("text/html");
        expect(data.statusCode).toEqual(1);
    });
});
