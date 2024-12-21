/** @format */

import { TraceManager } from "#core/infra/TraceManager";
import { IDBConnection } from "#interface";
import { guid } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.TraceManager", () => {
    const traceMgr = new TraceManager();
    traceMgr.setId(guid());

    it("trace id", () => {
        expect(traceMgr.getId()).not.toEqual("");
    });
});
