/** @format */

import { RedisConverter } from "#utils/db/RedisConverter";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.db.RedisConverter", () => {
    it("getDatabase", () => {
        expect(RedisConverter.getDatabase("test")).toEqual(0);
        expect(RedisConverter.getDatabase("17")).toEqual(0);
        expect(RedisConverter.getDatabase("-1")).toEqual(0);
        expect(RedisConverter.getDatabase("10")).toEqual(10);
    });
});
