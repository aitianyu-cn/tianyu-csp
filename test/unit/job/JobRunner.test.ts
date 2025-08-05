/** @format */

import { JobRunner } from "#job";

describe("aitianyu-cn.node-module.tianyu-csp.unit.job.JobRunner", () => {
    const worker: any = {
        status: "done",
        exitCode: 200,
        value: undefined,
        error: undefined,
        run: async () => Promise.resolve(),
        terminate: async () => Promise.resolve(),
    };
    describe("timeoutHandler", () => {
        it("is released", async () => {
            jest.spyOn(worker, "terminate");

            const runner = new JobRunner(worker, {
                resolve: () => undefined,
                executionId: "",
                overtime: 3000,
                script: "",
                payload: { module: "", method: "", package: "", options: { workerData: {} } },
            });

            runner["_released"] = true;

            await runner.timeoutHandler();

            expect(worker.terminate).not.toHaveBeenCalled();
        });

        it("terminate throw an error", async () => {
            let result: any = {};

            const ERROR_SPY = jest.spyOn(TIANYU.logger, "error").mockImplementation(async () => Promise.resolve());
            jest.spyOn(worker, "terminate").mockImplementation(async () => Promise.reject());

            const runner = new JobRunner(worker, {
                resolve: (res) => {
                    result = res;
                },
                executionId: "",
                overtime: 3000,
                script: "",
                payload: { module: "", method: "", package: "", options: { workerData: {} } },
            });

            await runner.timeoutHandler();

            expect(worker.terminate).toHaveBeenCalled();
            expect(ERROR_SPY).toHaveBeenCalled();
            expect(result.status).toEqual("timeout");
        });

        it("terminate success", async () => {
            let result: any = {};

            const ERROR_SPY = jest.spyOn(TIANYU.logger, "error").mockImplementation(async () => Promise.resolve());
            jest.spyOn(worker, "terminate").mockImplementation(async () => Promise.resolve());

            const runner = new JobRunner(worker, {
                resolve: (res) => {
                    result = res;
                },
                executionId: "",
                overtime: 3000,
                script: "",
                payload: { module: "", method: "", package: "", options: { workerData: {} } },
            });

            await runner.timeoutHandler();

            expect(worker.terminate).toHaveBeenCalled();
            expect(ERROR_SPY).not.toHaveBeenCalled();
            expect(result.status).toEqual("timeout");
        });
    });

    describe("run", () => {
        it("runWorker error occurs", async () => {
            const ERROR_SPY = jest.spyOn(TIANYU.logger, "error").mockImplementation(async () => Promise.resolve());
            jest.spyOn(worker, "run").mockImplementation(async () => Promise.reject());

            const runner = new JobRunner(worker, {
                resolve: () => undefined,
                executionId: "",
                overtime: 3000,
                script: "",
                payload: { module: "", method: "", package: "", options: { workerData: {} } },
            });

            jest.spyOn(runner, "timeoutHandler").mockImplementation(async () => Promise.resolve());

            await runner.run();

            expect(ERROR_SPY).toHaveBeenCalled();
        });

        it("normal case", async () => {
            jest.spyOn(worker, "run").mockImplementation(
                async () =>
                    new Promise<void>((resolve) => {
                        setTimeout(resolve, 500);
                    }),
            );
            jest.spyOn(worker, "terminate").mockImplementation(async () => Promise.resolve());

            const runner = new JobRunner(worker, {
                resolve: () => undefined,
                executionId: "",
                overtime: 3000,
                script: "",
                payload: { module: "", method: "", package: "", options: { workerData: {} } },
            });
            await runner.run();

            expect(runner["_result"].status).toEqual("done");
        });

        it("timeout case", async () => {
            let done: Function = () => undefined;
            let isDone = false;
            let timer: any = null;

            jest.spyOn(worker, "run").mockImplementation(
                async () =>
                    new Promise<void>((resolve) => {
                        done = resolve;
                        timer = setTimeout(() => {
                            if (!isDone) {
                                timer = null;
                                isDone = true;
                                resolve();
                            }
                        }, 2000);
                    }),
            );
            jest.spyOn(worker, "terminate").mockImplementation(async () => {
                if (!isDone) {
                    isDone = true;
                    timer && clearTimeout(timer);
                    done();
                }
            });

            const runner = new JobRunner(worker, {
                resolve: () => undefined,
                executionId: "",
                overtime: 1000,
                script: "",
                payload: { module: "", method: "", package: "", options: { workerData: {} } },
            });
            await runner.run();

            expect(runner["_result"].status).toEqual("timeout");
        }, 50000);
    });
});
