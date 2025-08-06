/** @format */

import { Pattern } from "#global";

describe("aitianyu-cn.node-module.tianyu-csp.unit.global.Pattern", () => {
    it("test", () => {
        const pattern_str = ["/aaa/bbb/ccc", "/fff", ""];
        const pattern = new Pattern(pattern_str);

        expect(pattern.test("/")).toBeFalsy();

        expect(pattern.test("/aaa")).toBeFalsy();
        expect(pattern.test("/aaa/bbb")).toBeFalsy();
        expect(pattern.test("/aaa/bbb/ddd")).toBeFalsy();

        expect(pattern.test("/pppp")).toBeFalsy();

        expect(pattern.test("/aaa/bbb/ccc")).toBeTruthy();
        expect(pattern.test("/fff/aaa")).toBeTruthy();
    });
});
