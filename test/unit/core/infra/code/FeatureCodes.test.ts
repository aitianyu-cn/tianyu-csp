/** @format */

import {
    handleFeatureGetCount,
    handleFeatureGetFeatures,
    handleFeatureIsActive,
    handleFeatureSearchFeatures,
    handleFeatureStateChange,
} from "#core/infra/code/FeatureCodes";
import { IDBConnection } from "#interface";
import { MapOfBoolean } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.code.FeatureCodes", () => {
    const connection: IDBConnection = {
        name: "",
        execute: async (_sql: string) => Promise.resolve(),
        executeBatch: async (_sqls: string[]) => Promise.resolve(),
        query: async (_sql: string) => Promise.resolve([]),
        close: () => undefined,
    };

    beforeEach(() => {
        jest.spyOn(TIANYU.db, "connect").mockReturnValue(connection);
        jest.spyOn(TIANYU.logger, "error");
    });

    describe("handleFeatureIsActive", () => {
        it("query failed", async () => {
            jest.spyOn(connection, "query").mockReturnValue(Promise.reject(""));

            const active = await handleFeatureIsActive("");

            expect(TIANYU.logger.error).toHaveBeenCalled();
            expect(active).toBeFalsy();
        });

        it("success", async () => {
            jest.spyOn(connection, "query").mockReturnValue(Promise.resolve([{ enable: true }]));

            const active = await handleFeatureIsActive("");

            expect(TIANYU.logger.error).not.toHaveBeenCalled();
            expect(active).toBeTruthy();
        });
    });

    describe("handleFeatureGetCount", () => {
        it("query failed", async () => {
            jest.spyOn(connection, "query").mockReturnValue(Promise.reject(""));

            const counter = await handleFeatureGetCount();

            expect(TIANYU.logger.error).toHaveBeenCalled();
            expect(counter).toEqual(0);
        });

        it("query empty", async () => {
            jest.spyOn(connection, "query").mockReturnValue(Promise.resolve([]));

            const counter = await handleFeatureGetCount();

            expect(TIANYU.logger.error).not.toHaveBeenCalled();
            expect(counter).toEqual(0);
        });

        it("return invalid", async () => {
            jest.spyOn(connection, "query").mockReturnValue(Promise.resolve([{ counter: "abc" }]));

            const counter = await handleFeatureGetCount();

            expect(TIANYU.logger.error).not.toHaveBeenCalled();
            expect(counter).toEqual(0);
        });

        it("success", async () => {
            jest.spyOn(connection, "query").mockReturnValue(Promise.resolve([{ counter: "234" }]));

            const counter = await handleFeatureGetCount();

            expect(TIANYU.logger.error).not.toHaveBeenCalled();
            expect(counter).toEqual(234);
        });
    });

    describe("handleFeatureGetFeatures", () => {
        it("query failed", async () => {
            jest.spyOn(connection, "query").mockReturnValue(Promise.reject(""));

            const features = await handleFeatureGetFeatures(0, 1000);

            expect(TIANYU.logger.error).toHaveBeenCalled();
            expect(Object.keys(features).length).toEqual(0);
        });

        it("success", async () => {
            jest.spyOn(connection, "query").mockReturnValue(
                Promise.resolve([
                    { id: "F1", enable: 1, desc: "desc1", deps: "" },
                    { id: "F2", enable: 1, desc: "", deps: "F1,," },
                    { id: "F3", enable: 1, desc: "", deps: "F1 , F2" },
                    { enable: 1, desc: "", deps: "F1 , F2" },
                ]),
            );

            const features = await handleFeatureGetFeatures(0, 1000);

            expect(TIANYU.logger.error).not.toHaveBeenCalled();
            expect(Object.keys(features).length).toEqual(3);

            expect(features["F1"].enable).toBeTruthy();
            expect(features["F2"].enable).toBeTruthy();
            expect(features["F3"].enable).toBeTruthy();

            expect(features["F1"].description).toEqual("desc1");
            expect(features["F2"].description).toEqual("");
            expect(features["F3"].description).toEqual("");

            expect(features["F1"].dependency).toEqual([]);
            expect(features["F2"].dependency).toEqual(["F1"]);
            expect(features["F3"].dependency).toEqual(["F1", "F2"]);
        });
    });

    describe("handleFeatureStateChange", () => {
        const changes: MapOfBoolean = {
            F1: true,
            F2: false,
        };

        it("execute failed", async () => {
            jest.spyOn(connection, "executeBatch").mockReturnValue(Promise.reject(""));

            await handleFeatureStateChange(changes);

            expect(TIANYU.logger.error).toHaveBeenCalled();
        });

        it("success", async () => {
            jest.spyOn(connection, "executeBatch").mockReturnValue(Promise.resolve());

            await handleFeatureStateChange(changes);

            expect(TIANYU.logger.error).not.toHaveBeenCalled();
        });
    });

    describe("handleFeatureSearchFeatures", () => {
        it("query failed", async () => {
            jest.spyOn(connection, "query").mockReturnValue(Promise.reject(""));

            const features = await handleFeatureSearchFeatures("SEARCH", 1000);

            expect(TIANYU.logger.error).toHaveBeenCalled();
            expect(Object.keys(features).length).toEqual(0);
        });

        it("success", async () => {
            jest.spyOn(connection, "query").mockReturnValue(
                Promise.resolve([
                    { id: "F1", enable: 1, desc: "desc1", deps: "" },
                    { id: "F2", enable: 1, desc: "", deps: "F1,," },
                    { id: "F3", enable: 1, desc: "", deps: "F1 , F2" },
                    { enable: 1, desc: "", deps: "F1 , F2" },
                ]),
            );

            const features = await handleFeatureSearchFeatures("SEARCH", 1000);

            expect(TIANYU.logger.error).not.toHaveBeenCalled();
            expect(Object.keys(features).length).toEqual(3);

            expect(features["F1"].enable).toBeTruthy();
            expect(features["F2"].enable).toBeTruthy();
            expect(features["F3"].enable).toBeTruthy();

            expect(features["F1"].description).toEqual("desc1");
            expect(features["F2"].description).toEqual("");
            expect(features["F3"].description).toEqual("");

            expect(features["F1"].dependency).toEqual([]);
            expect(features["F2"].dependency).toEqual(["F1"]);
            expect(features["F3"].dependency).toEqual(["F1", "F2"]);
        });
    });
});
