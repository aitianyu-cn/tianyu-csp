/** @format */

import { Base32 } from "#base/crypto";
import { TOTP } from "packages/modules/auth";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.auth.TOTP", () => {
    it("generate", () => {
        const SPY = jest.spyOn(Base32, "random");
        TOTP.generate();
        expect(SPY).toHaveBeenCalled();
    });

    it("code", async () => {
        const key = "AQEYJRS7CJLLMKX5HTWNZ75VJEFYXFD5";
        const time = new Date("2025-8-15 18:02:15").getTime();
        const code = "224390";

        jest.spyOn(Date, "now").mockReturnValue(time);

        const gen = TOTP.code(key);

        expect(gen).toEqual(code);
    });

    it("getUrl", () => {
        const { key, url } = TOTP.getUrl("test_Admin");
        expect(url).toEqual(`otpauth://totp/test_Admin?secret=${key}&issuer=CSP-Test-App`);
    });
});
