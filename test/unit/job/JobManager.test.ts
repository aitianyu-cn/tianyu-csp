/** @format */

import { createContributor } from "#core/InfraLoader";
import { JobManager } from "#job";
import { guid } from "@aitianyu.cn/types";
import { PROJECT_ROOT_PATH } from "packages/Common";
import path from "path";

describe("aitianyu-cn.node-module.tianyu-csp.unit.job.JobWorker", () => {
    const contributor = createContributor();
    const JOB_MGR_ID = guid();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let jobMgr: any = null;

    beforeAll(() => {
        jobMgr = new JobManager({ limitWorkers: 3, id: JOB_MGR_ID }, contributor);
    });

    it("run", (done) => {
        const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/multi-job.js");

        const dispatcher = contributor.findModule("job-manager.dispatch", JOB_MGR_ID);
        expect(dispatcher).toBeDefined();
        if (!dispatcher) {
            done();
            return;
        }

        const jobCreater = async (id: string) => {
            return dispatcher({
                script: file,
                payload: { module: "", method: "", package: "", options: { workerData: { id: id, time: 500 } } },
            }).then(
                async (value) => {
                    return Promise.resolve(value?.value === id);
                },
                async () => {
                    return Promise.resolve(false);
                },
            );
        };
        const jobIds = ["1", "2", "3", "4", "5", "6"];
        const jobPromises: Promise<boolean>[] = [];
        for (const id of jobIds) {
            jobPromises.push(jobCreater(id));
        }

        Promise.all(jobPromises).then(
            (status) => {
                expect(status.includes(false)).toBeFalsy();
                done();
            },
            () => done.fail(),
        );
    }, 30000);

    it("run with timeout", (done) => {
        const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/multi-job.js");

        const dispatcher = contributor.findModule("job-manager.dispatch", JOB_MGR_ID);
        expect(dispatcher).toBeDefined();
        if (!dispatcher) {
            done();
            return;
        }

        dispatcher({
            script: file,
            payload: {
                module: "",
                method: "",
                package: "",
                options: { workerData: { id: "", time: 3000 }, overtime: 1000 },
            },
        }).then(
            (value) => {
                expect(value.status).toEqual("timeout");
                done();
            },
            () => done.fail(),
        );
    }, 30000);
});
