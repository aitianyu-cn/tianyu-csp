/** @format */

import { JobManager } from "#job/JobManager";
import { guid } from "@aitianyu.cn/types";
import { PROJECT_ROOT_PATH } from "packages/Common";
import path from "path";

describe("aitianyu-cn.node-module.tianyu-csp.unit.job.JobWorker", () => {
    let jobMgr: any = null;
    const JOB_MGR_ID = guid();

    beforeAll(() => {
        jobMgr = new JobManager({ limitWorkers: 3, id: JOB_MGR_ID });
    });

    it("run", (done) => {
        const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/multi-job.js");

        const dispatcher = TIANYU.fwk.contributor.findModule("job-manager.dispatch", JOB_MGR_ID);
        expect(dispatcher).toBeDefined();
        if (!dispatcher) {
            done();
            return;
        }

        let error = 0;
        const jobCreater = (id: string) => {
            return dispatcher({
                script: file,
                payload: { module: "", method: "", package: "", options: { workerData: { id: id, time: 500 } } },
            }).then(
                (value) => {
                    return Promise.resolve(value?.value === id);
                },
                () => {
                    error++;
                    return Promise.resolve(false);
                },
            );
        };
        const jobIds = ["1", "2", "3", "4", "5", "6"];
        const jobPromises: Promise<boolean>[] = [];
        for (const id of jobIds) {
            jobPromises.push(jobCreater(id));
        }

        Promise.all(jobPromises).then((status) => {
            expect(status.includes(false)).toBeFalsy();
            done();
        }, done.fail);
    }, 30000);

    it("run with timeout", (done) => {
        const file = path.resolve(PROJECT_ROOT_PATH, "test/content/job/multi-job.js");

        const dispatcher = TIANYU.fwk.contributor.findModule("job-manager.dispatch", JOB_MGR_ID);
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
        }).then((value) => {
            expect(value.status).toEqual("timeout");
            done();
        }, done.fail);
    }, 30000);
});
