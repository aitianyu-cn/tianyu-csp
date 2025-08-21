/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { AreaCode } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.base.object.InternalMessageBundle", () => {
    it("get default", () => {
        expect(MessageBundle.text("ERROR_BASE_CRYPTO_BASE32_INVALID_INDEX", "a", "b")).toEqual('在字母表 "b" 中无法索引 a 字符');
    });

    it("get with language", () => {
        expect(MessageBundle.areaText("ERROR_BASE_CRYPTO_BASE32_INVALID_INDEX", AreaCode.en_US, "a", "b")).toEqual(
            'Invalid index: a in alphabet "b"',
        );
    });
});
