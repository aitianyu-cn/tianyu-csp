/** @format */

import { DBHelper } from "#utils";

describe("aitianyu-cn.node-module.tianyu-csp.unit.utils.db.RedisConverter", () => {
    it("getDatabase", () => {
        expect(DBHelper.converter.redis({}, "test").db).toEqual(0);
        expect(DBHelper.converter.redis({}, "17").db).toEqual(0);
        expect(DBHelper.converter.redis({}, "-1").db).toEqual(0);
        expect(DBHelper.converter.redis({}, "10").db).toEqual(10);
    });
});
