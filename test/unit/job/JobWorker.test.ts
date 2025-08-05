/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { JobWorkerPayload } from "#interface";
import { JobWorker } from "#job";
import { PROJECT_ROOT_PATH } from "packages/Common";
import path from "path";
import * as TYPES from "@aitianyu.cn/types";

describe("aitianyu-cn.node-module.tianyu-csp.unit.job.JobWorker", () => {
    describe("run", () => {
        it("success", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            worker.run(file, payload, "id").then(
                () => {
                    expect(worker.id).not.toEqual("");
                    expect(worker.executionId).toEqual("id");
                    expect(worker.status).toEqual("done");

                    expect(worker.exitCode).toEqual(10);
                    expect(worker.value?.data).toEqual({ inp: true, ret: "success" });
                    expect(worker.error.length).toEqual(0);

                    done();
                },
                () => done.fail(),
            );
        });

        it("warning", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/warning.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            worker.run(file, payload).then(
                () => {
                    expect(worker.status).toEqual("done");

                    expect(worker.exitCode).toEqual(20);
                    expect(worker.value?.data).toEqual({ inp: true, ret: "warning" });
                    expect(worker.value?.error.length).toEqual(1);

                    expect(worker.value?.error[0].code).toEqual("5000");
                    expect(worker.value?.error[0].message).toEqual("this is a warning");
                    expect(worker.error).toEqual("");

                    done();
                },
                () => done.fail(),
            );
        });

        it("error", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/error.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            worker.run(file, payload).then(
                () => {
                    expect(worker.status).toEqual("error");

                    expect(worker.exitCode).toEqual(1);
                    expect(worker.value?.data).toEqual({ inp: true, ret: "error" });
                    expect(worker.value?.error.length).toEqual(1);
                    expect(worker.value?.error[0].code).toEqual("5000");
                    expect(worker.value?.error[0].message).toEqual("this is a error");
                    expect(worker.error).toEqual("error");

                    done();
                },
                () => done.fail(),
            );
        });

        it("run in invalid status throw error", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            worker["_status"] = "invalid";
            worker.run(file, payload, "id").then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.message).toEqual("New job run failed, Preious job is in running or has fatal error.");
                    expect(error.code).toEqual(SERVICE_ERROR_CODES.PRE_JOB_INVALID);
                    done();
                },
            );
        });

        it("run without reset env - throw error", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();

            const runPromise = new Promise<void>((resolve, reject) => {
                worker.run(file, payload, "id").then(() => {
                    expect(worker.id).not.toEqual("");
                    expect(worker.executionId).toEqual("id");
                    expect(worker.status).toEqual("done");

                    expect(worker.exitCode).toEqual(10);
                    expect(worker.value?.data).toEqual({ inp: true, ret: "success" });
                    expect(worker.error.length).toEqual(0);

                    resolve();
                }, reject);
            });

            runPromise.then(
                () => {
                    worker.run(file, payload, "id").then(
                        () => {
                            done.fail();
                        },
                        (error) => {
                            expect(error.message).toEqual("New job run failed, Preious job is in running or has fatal error.");
                            expect(error.code).toEqual(SERVICE_ERROR_CODES.PRE_JOB_RUNNING);
                            done();
                        },
                    );
                },
                () => done.fail(),
            );
        });
    });

    describe("run - error", () => {
        it("error with string", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            jest.spyOn(TYPES, "guid").mockImplementation(() => {
                throw "error-test";
            });
            worker.run(file, payload).then(
                () => {
                    expect(worker.id).not.toEqual("");
                    expect(worker.status).toEqual("invalid");

                    expect(worker.exitCode).toEqual(40000);
                    expect(worker.error).toEqual("error-test");

                    done();
                },
                () => done.fail(),
            );
        });

        it("error with exception", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            jest.spyOn(TYPES, "guid").mockImplementation(() => {
                throw "error-test";
            });
            worker.run(file, payload).then(
                () => {
                    expect(worker.id).not.toEqual("");
                    expect(worker.status).toEqual("invalid");

                    expect(worker.exitCode).toEqual(40000);
                    expect(worker.error).toEqual("error-test");

                    done();
                },
                () => done.fail(),
            );
        });

        it("error with exception - worker error", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            jest.spyOn(TYPES, "guid").mockImplementation(() => {
                worker["_worker"] = {
                    threadId: 100,
                    terminate: async () => Promise.resolve(0),
                } as any;
                throw "error-test";
            });
            worker.run(file, payload).then(
                () => {
                    expect(worker.id).not.toEqual("");
                    expect(worker.status).toEqual("invalid");

                    expect(worker.exitCode).toEqual(40000);
                    expect(worker.error).toEqual("error-test");

                    done();
                },
                () => done.fail(),
            );
        });

        it("error with exception - worker error in exception type", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            jest.spyOn(TYPES, "guid").mockImplementation(() => {
                worker["_worker"] = {
                    threadId: 100,
                    terminate: async () => Promise.resolve(0),
                } as any;
                throw new Error("error-test");
            });
            worker.run(file, payload).then(
                () => {
                    expect(worker.id).not.toEqual("");
                    expect(worker.status).toEqual("invalid");

                    expect(worker.exitCode).toEqual(40000);
                    expect(worker.error).toEqual("error-test");

                    done();
                },
                () => done.fail(),
            );
        });

        it("error with exception - worker error undefined error", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            jest.spyOn(TYPES, "guid").mockImplementation(() => {
                worker["_worker"] = {
                    threadId: 100,
                    terminate: async () => Promise.resolve(0),
                } as any;
                throw new Error();
            });
            worker.run(file, payload).then(
                () => {
                    expect(worker.id).not.toEqual("");
                    expect(worker.status).toEqual("invalid");

                    expect(worker.exitCode).toEqual(40000);
                    expect(worker.error).toEqual("");

                    done();
                },
                () => done.fail(),
            );
        });

        it("error with exception - worker error - terminate cause an error", (done) => {
            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/success.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            jest.spyOn(TYPES, "guid").mockImplementation(() => {
                worker["_worker"] = {
                    threadId: 100,
                    terminate: async () => Promise.reject(),
                } as any;
                throw "error-test";
            });
            worker.run(file, payload).then(
                () => {
                    expect(worker.id).not.toEqual("");
                    expect(worker.status).toEqual("invalid");

                    expect(worker.exitCode).toEqual(40000);
                    expect(worker.error).toEqual("error-test");

                    done();
                },
                () => done.fail(),
            );
        });
    });

    it("reset", (done) => {
        const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/error.js");
        const payload: JobWorkerPayload = {
            options: {
                workerData: { inp: true },
            },
            package: "a",
            module: "a",
            method: "a",
        };

        const worker = new JobWorker();
        worker.run(file, payload).then(
            () => {
                expect(worker.status).toEqual("error");

                expect(worker.exitCode).toEqual(1);
                expect(worker.value?.data).toEqual({ inp: true, ret: "error" });
                expect(worker.value?.error.length).toEqual(1);
                expect(worker.value?.error[0].code).toEqual("5000");
                expect(worker.value?.error[0].message).toEqual("this is a error");
                expect(worker.error).toEqual("error");

                worker.reset();

                expect(worker.status).toEqual("active");
                expect(worker.executionId).toEqual("");
                expect(worker.error).toEqual("");
                expect(worker.exitCode).toEqual(0);
                expect(worker.value).toBeNull();

                done();
            },
            () => done.fail(),
        );
    });

    describe("terminate", () => {
        it("worker inited - success", (done) => {
            const worker = new JobWorker();
            worker["_worker"] = {
                threadId: 100,
                terminate: async () => Promise.resolve(10),
            } as any;

            worker.terminate().then(done, () => done.fail());
        });

        it("worker inited - failed", (done) => {
            const worker = new JobWorker();
            worker["_worker"] = {
                threadId: 100,
                terminate: async () => Promise.reject(10),
            } as any;

            worker.terminate().then(done, () => done.fail());
        });

        it("worker not inited", (done) => {
            const worker = new JobWorker();
            worker.terminate().then(done, () => done.fail());
        });
    });

    describe("run - console", () => {
        it("success", (done) => {
            const DEBUG_SPY = jest.spyOn(TIANYU.logger, "debug").mockImplementation(async () => Promise.resolve());

            const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/console.js");
            const payload: JobWorkerPayload = {
                options: {
                    workerData: { inp: true },
                },
                package: "a",
                module: "a",
                method: "a",
            };

            const worker = new JobWorker();
            worker.run(file, payload, "id").then(
                () => {
                    expect(DEBUG_SPY).toHaveBeenCalledTimes(2);

                    done();
                },
                () => done.fail(),
            );
        });
    });
});
