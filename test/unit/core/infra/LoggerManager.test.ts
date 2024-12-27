/** @format */

import * as XCALL from "#core/infra/code/GenericXcall";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.LoggerManager", () => {
    beforeEach(() => {
        jest.spyOn(XCALL, "doXcall").mockImplementation(() => Promise.resolve());
    });

    describe("success case", () => {
        it("log", (done) => {
            TIANYU.logger.log("test").then(() => {
                expect(XCALL.doXcall).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("info", (done) => {
            TIANYU.logger.info("test").then(() => {
                expect(XCALL.doXcall).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("warn", (done) => {
            TIANYU.logger.warn("test").then(() => {
                expect(XCALL.doXcall).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("debug", (done) => {
            TIANYU.logger.debug("test").then(() => {
                expect(XCALL.doXcall).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("error", (done) => {
            TIANYU.logger.error("test").then(() => {
                expect(XCALL.doXcall).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("fatal", (done) => {
            TIANYU.logger.fatal("test").then(() => {
                expect(XCALL.doXcall).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("substring", (done) => {
            TIANYU.logger.fatal("this is a test message which the string length over 20.").then(() => {
                expect(XCALL.doXcall).toHaveBeenCalled();
                done();
            }, done.fail);
        });
    });
});
