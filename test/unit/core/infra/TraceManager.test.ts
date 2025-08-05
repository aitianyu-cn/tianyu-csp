/** @format */

import { TraceManager } from "#core/infra/TraceManager";
import { guid } from "@aitianyu.cn/types";
import * as XCALL from "#core/infra/code/GenericXcall";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.TraceManager", () => {
    const traceMgr = new TraceManager();
    traceMgr.setId(guid());

    it("trace id", () => {
        expect(traceMgr.getId()).not.toEqual("");
    });

    describe("trace", () => {
        beforeEach(() => {
            jest.spyOn(XCALL, "doXcall").mockImplementation(async () => Promise.resolve());
        });

        it("no details and area", async () => {
            await traceMgr.trace("test");

            expect(XCALL.doXcall).toHaveBeenCalled();
        });

        it("has details and area", async () => {
            await traceMgr.trace("test", "details", "core");

            expect(XCALL.doXcall).toHaveBeenCalled();
        });

        it("substring", (done) => {
            traceMgr.trace("this is a test message which the string length over 20.").then(
                () => {
                    expect(XCALL.doXcall).toHaveBeenCalled();
                    done();
                },
                () => done.fail(),
            );
        });
    });
});
