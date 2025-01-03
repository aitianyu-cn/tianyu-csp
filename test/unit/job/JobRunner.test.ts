/** @format */

import { JobRunner } from "#job";

describe("aitianyu-cn.node-module.tianyu-csp.unit.job.JobRunner", () => {
    const worker: any = {
        status: "done",
        exitCode: 200,
        value: undefined,
        error: undefined,
        run: () => Promise.resolve(),
        terminate: () => Promise.resolve(),
    };
    describe("timeoutHandler", () => {
        it("is released", async () => {
            jest.spyOn(worker, "terminate");

            const runner = new JobRunner(worker, {
                resolve: () => {},
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

            jest.spyOn(TIANYU.logger, "error").mockImplementation(() => Promise.resolve());
            jest.spyOn(worker, "terminate").mockImplementation(() => Promise.reject());

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
            expect(TIANYU.logger.error).toHaveBeenCalled();
            expect(result.status).toEqual("timeout");
        });

        it("terminate success", async () => {
            let result: any = {};

            jest.spyOn(TIANYU.logger, "error").mockImplementation(() => Promise.resolve());
            jest.spyOn(worker, "terminate").mockImplementation(() => Promise.resolve());

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
            expect(TIANYU.logger.error).not.toHaveBeenCalled();
            expect(result.status).toEqual("timeout");
        });
    });

    describe("run", () => {
        it("runWorker error occurs", async () => {
            jest.spyOn(TIANYU.logger, "error").mockImplementation(() => Promise.resolve());
            jest.spyOn(worker, "run").mockImplementation(() => Promise.reject());

            const runner = new JobRunner(worker, {
                resolve: () => {},
                executionId: "",
                overtime: 3000,
                script: "",
                payload: { module: "", method: "", package: "", options: { workerData: {} } },
            });

            jest.spyOn(runner, "timeoutHandler").mockImplementation(() => Promise.resolve());

            await runner.run();

            expect(TIANYU.logger.error).toHaveBeenCalled();
        });

        it("normal case", async () => {
            jest.spyOn(worker, "run").mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        setTimeout(resolve, 500);
                    }),
            );
            jest.spyOn(worker, "terminate").mockImplementation(() => Promise.resolve());

            const runner = new JobRunner(worker, {
                resolve: () => {},
                executionId: "",
                overtime: 3000,
                script: "",
                payload: { module: "", method: "", package: "", options: { workerData: {} } },
            });
            await runner.run();

            expect(runner["_result"].status).toEqual("done");
        });

        it("timeout case", async () => {
            let done = () => {};
            let isDone = false;
            let timer: any = null;

            jest.spyOn(worker, "run").mockImplementation(
                () =>
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
                resolve: () => {},
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
