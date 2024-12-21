/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import {
    handleSession,
    handleSessionIsAdminMode,
    handleSessionPrivileges,
    handleSessionUser,
} from "#core/infra/code/SessionCodes";
import { IDBConnection } from "#interface";

const SESSION_ID = "session_id";
const USER_ID = "test_user";
const LICENSE_ID = "test_license";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.code.SessionCodes", () => {
    const connection: IDBConnection = {
        name: "",
        execute: async (_sql: string) => Promise.resolve(),
        executeBatch: async (_sqls: string[]) => Promise.resolve(),
        query: async (_sql: string) => Promise.resolve([]),
        close: () => undefined,
    };

    beforeEach(() => {
        jest.spyOn(TIANYU.db, "connect").mockReturnValue(connection);
    });

    it("-", () => {});

    // describe("handleSession", () => {
    //     it("query return null", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(Promise.resolve(null));

    //         handleSession(SESSION_ID).then(done.fail, (error) => {
    //             expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_SESSION_NOT_VALID);
    //             expect(error.message).toEqual("Session not valid.");
    //             done();
    //         });
    //     });

    //     it("query return empty", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(Promise.resolve([]));

    //         handleSession(SESSION_ID).then(done.fail, (error) => {
    //             expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_SESSION_NOT_VALID);
    //             expect(error.message).toEqual("Session not valid.");
    //             done();
    //         });
    //     });

    //     it("session timeout", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(
    //             Promise.resolve([
    //                 {
    //                     userId: USER_ID,
    //                     time: "2024-07-20 10:10:10:000",
    //                 },
    //             ]),
    //         );

    //         handleSession(SESSION_ID).then(done.fail, (error) => {
    //             expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_SESSION_OUT_OF_TIME);
    //             expect(error.message).toEqual("Session not valid.");
    //             done();
    //         });
    //     });

    //     it("session success", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(
    //             Promise.resolve([
    //                 {
    //                     userId: USER_ID,
    //                     time: Date.now(),
    //                 },
    //             ]),
    //         );

    //         handleSession(SESSION_ID).then((user) => {
    //             expect(user).toEqual(USER_ID);
    //             done();
    //         }, done.fail);
    //     });
    // });

    // describe("handleSessionUser", () => {
    //     it("query return null", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(Promise.resolve(null));

    //         handleSessionUser(USER_ID).then(
    //             () => {
    //                 done.fail();
    //             },
    //             (error) => {
    //                 expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_NOT_FOUND);
    //                 expect(error.message).toEqual("User not valid.");
    //                 done();
    //             },
    //         );
    //     });

    //     it("query return empty", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(Promise.resolve([]));

    //         handleSessionUser(USER_ID).then(
    //             () => {
    //                 done.fail();
    //             },
    //             (error) => {
    //                 expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_NOT_FOUND);
    //                 expect(error.message).toEqual("User not valid.");
    //                 done();
    //             },
    //         );
    //     });

    //     it("success", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(
    //             Promise.resolve([
    //                 {
    //                     name: "Test User",
    //                     license: LICENSE_ID,
    //                 },
    //             ]),
    //         );

    //         handleSessionUser(USER_ID).then((userInfo) => {
    //             expect(userInfo.name).toEqual("Test User");
    //             expect(userInfo.license).toEqual(LICENSE_ID);
    //             done();
    //         }, done.fail);
    //     });
    // });

    // describe("handleSessionIsAdminMode", () => {
    //     it("query return null", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(Promise.resolve(null));

    //         handleSessionIsAdminMode(LICENSE_ID).then(
    //             () => {
    //                 done.fail();
    //             },
    //             (error) => {
    //                 expect(error.code).toEqual(SERVICE_ERROR_CODES.LICENSE_ERROR);
    //                 expect(error.message).toEqual("license not valid.");
    //                 done();
    //             },
    //         );
    //     });

    //     it("query return empty", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(Promise.resolve([]));

    //         handleSessionIsAdminMode(LICENSE_ID).then(
    //             () => {
    //                 done.fail();
    //             },
    //             (error) => {
    //                 expect(error.code).toEqual(SERVICE_ERROR_CODES.LICENSE_ERROR);
    //                 expect(error.message).toEqual("license not valid.");
    //                 done();
    //             },
    //         );
    //     });

    //     it("success", (done) => {
    //         jest.spyOn(connection, "query").mockReturnValue(Promise.resolve([{ admin: true }]));

    //         handleSessionIsAdminMode(LICENSE_ID).then((adminInfo) => {
    //             expect(adminInfo.admin).toBeTruthy();
    //             done();
    //         }, done.fail);
    //     });
    // });

    // it("handleSessionPrivileges", (done) => {
    //     jest.spyOn(connection, "query").mockReturnValue(
    //         Promise.resolve([
    //             { name: "p1", read: 1, write: 1, delete: 0, change: 1, execute: 1 },
    //             { name: "p2", read: 1, write: 1, delete: 0, change: 1, execute: 1 },
    //             { name: "p3", read: 1, write: 1, delete: 0, change: 1, execute: 1 },
    //             { name: "p4", read: 1, write: 1, delete: 0, change: 1, execute: 1 },
    //         ]),
    //     );

    //     handleSessionPrivileges(LICENSE_ID).then((result) => {
    //         expect(result["p1"]).toBeDefined();
    //         expect(result["p2"]).toBeDefined();
    //         expect(result["p3"]).toBeDefined();
    //         expect(result["p4"]).toBeDefined();

    //         for (const key of Object.keys(result)) {
    //             const priv = result[key];
    //             expect(priv.read).toBeTruthy();
    //             expect(priv.write).toBeTruthy();
    //             expect(priv.delete).toBeFalsy();
    //             expect(priv.change).toBeTruthy();
    //             expect(priv.execute).toBeTruthy();
    //         }
    //         done();
    //     }, done.fail);
    // });
});
