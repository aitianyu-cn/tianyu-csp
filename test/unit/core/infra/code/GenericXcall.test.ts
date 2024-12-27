/** @format */

import { doXcall } from "#core/infra/code/GenericXcall";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.code.GenericXcall", () => {
    describe("doXcall", () => {
        beforeEach(() => {
            jest.spyOn(TIANYU.logger, "error").mockImplementation(() => Promise.resolve());
        });

        it("external call not exist", async () => {
            const result = await doXcall({}, "func", "method", "");
            expect(result).toBeNull();
            expect(TIANYU.logger.error).toHaveBeenCalled();
        });

        it("could not import module", async () => {
            jest.spyOn(TIANYU, "import");

            const result = await doXcall({}, "test", "nopackage", "");

            expect(TIANYU.import).toHaveBeenCalledWith("", "");
            expect(result).toBeNull();
            expect(TIANYU.logger.error).toHaveBeenCalled();
        });

        it("run a default function", async () => {
            const result = await doXcall({}, "test", "default_method", "");

            expect(result).toEqual("DEFAULT_RETURN");
            expect(TIANYU.logger.error).not.toHaveBeenCalled();
        });

        it("run a success function", async () => {
            const result = await doXcall({}, "test", "success", "");

            expect(result).toEqual("SUCCESS");
            expect(TIANYU.logger.error).not.toHaveBeenCalled();
        });

        it("run a no return function", async () => {
            const result = await doXcall({}, "test", "noreturn", "");

            expect(result).toBeNull();
            expect(TIANYU.logger.error).not.toHaveBeenCalled();
        });

        it("run an exception function", async () => {
            const result = await doXcall({}, "test", "failed", "");

            expect(result).toBeNull();
            expect(TIANYU.logger.error).toHaveBeenCalled();
        });

        it("run a not function", async () => {
            const result = await doXcall({}, "test", "notfunction", "");

            expect(result).toBeNull();
            expect(TIANYU.logger.error).toHaveBeenCalled();
        });
    });
});
