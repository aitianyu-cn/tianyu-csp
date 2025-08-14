/** @format */

import { Bytes } from "#base/object/Bytes";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.object.Bytes", () => {
    it("random", () => {
        const bytes = Bytes.random(10);
        expect(bytes.byteLength).toEqual(10);
    });
});
