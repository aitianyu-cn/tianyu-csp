/** @format */

import { commander } from "packages/Commander";

describe("aitianyu-cn.node-module.tianyu-csp.unit.Commander", () => {
    it("home", () => {
        expect(commander(["a/b", "c.js", "-c", "-h", "test"]).homedir).toEqual("test");
        expect(commander(["a/b", "c.js", "-c", "--home", "test2"]).homedir).toEqual("test2");
        expect(commander(["a/b", "c.js", "-c", "--home", ""]).homedir).toEqual("");
    });
});
