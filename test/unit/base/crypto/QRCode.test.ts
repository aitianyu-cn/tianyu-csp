/** @format */

import { QRCode } from "#base/crypto";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.crypto.QRCode", () => {
    it("success", async () => {
        const code = await QRCode.getURL("https://aitianyu.cn");
        expect(code.startsWith("data:image/png;base64,")).toBeTruthy();
    });

    it("failed", async () => {
        expect(await QRCode.getURL({} as any)).toEqual("");
    });
});
