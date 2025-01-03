/** @format */

import { ContributorManager } from "#core/infra/ContributorManager";
import { ContributorFactor, JobWorkerExecutionResult, JobWorkerPayload } from "#interface";
import { ErrorHelper } from "#utils";
import { getBoolean, guid } from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.ContributorManager", () => {
    const contributorMgr = new ContributorManager();

    it("set a new endpoint", () => {
        contributorMgr.registerEndpoint("job-manager.dispatch");

        expect(contributorMgr.hasEndpoint("job-manager.dispatch")).toBeTruthy();
    });

    it("delete an endpoint", () => {
        contributorMgr.unregisterEndpoint("job-manager.dispatch");

        expect(contributorMgr.hasEndpoint("job-manager.dispatch")).toBeFalsy();
    });

    describe("sequence", () => {
        beforeAll(() => {
            contributorMgr.registerEndpoint("job-manager.dispatch");
        });

        const moduleId = guid();
        const module: ContributorFactor<
            { script: string; payload: JobWorkerPayload },
            Promise<JobWorkerExecutionResult>
        > = async (data: { script: string; payload: JobWorkerPayload }): Promise<JobWorkerExecutionResult> => {
            const result: JobWorkerExecutionResult = {
                exitCode: 0,
                value: data.payload.options.workerData,
                error: [],
                status: "done",
            };

            if (!data.payload.options.workerData) {
                result.error.push(ErrorHelper.getError("9999", "error", "error"));
            }

            return result;
        };

        it("export module", () => {
            contributorMgr.exportModule("job-manager.dispatch", moduleId, module);

            expect(getBoolean(contributorMgr["_map"].get("job-manager.dispatch")?.has(moduleId))).toBeTruthy();
        });

        it("find module", async () => {
            const find_module = contributorMgr.findModule("job-manager.dispatch", moduleId);

            expect(find_module).toBeDefined();

            if (find_module) {
                const res1 = await find_module({
                    script: "",
                    payload: {
                        options: {},
                        package: "",
                        module: "",
                        method: "",
                    },
                });
                expect(res1.value).toBeUndefined();
                expect(res1.error.length).toEqual(1);

                const work_data = {
                    a: 1,
                    b: "2",
                };
                const res2 = await find_module({
                    script: "",
                    payload: {
                        options: {
                            workerData: work_data,
                        },
                        package: "",
                        module: "",
                        method: "",
                    },
                });
                expect(res2.value).toEqual(work_data);
                expect(res2.error.length).toEqual(0);
            }
        });

        it("all modules", () => {
            const find_modules = contributorMgr.allModules("job-manager.dispatch");

            expect(Object.keys(find_modules).length).toEqual(1);
            expect(find_modules[moduleId]).toBeDefined();
        });

        it("export module", () => {
            contributorMgr.unexportModule("job-manager.dispatch", moduleId);

            expect(getBoolean(contributorMgr["_map"].get("job-manager.dispatch")?.has(moduleId))).toBeFalsy();
        });
    });
});
