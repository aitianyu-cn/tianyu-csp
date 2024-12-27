/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import {
    handleSession,
    handleSessionIsAdminMode,
    handleSessionPrivileges,
    handleSessionUser,
} from "#core/infra/code/SessionCodes";
import * as XCALL from "#core/infra/code/GenericXcall";

const SESSION_ID = "session_id";
const USER_ID = "test_user";
const LICENSE_ID = "test_license";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.code.SessionCodes", () => {
    let XCALL_SPYON: any;

    beforeEach(() => {
        XCALL_SPYON = jest.spyOn(XCALL, "doXcall");
    });

    describe("handleSession", () => {
        it("query return null", (done) => {
            XCALL_SPYON.mockReturnValue(Promise.resolve(null));

            handleSession(SESSION_ID).then(done.fail, (error) => {
                expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_SESSION_NOT_VALID);
                expect(error.message).toEqual("Session not valid.");
                done();
            });
        });

        it("session timeout", (done) => {
            XCALL_SPYON.mockReturnValue(
                Promise.resolve({
                    userId: USER_ID,
                    time: "2024-07-20 10:10:10:000",
                }),
            );

            handleSession(SESSION_ID).then(done.fail, (error) => {
                expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_SESSION_OUT_OF_TIME);
                expect(error.message).toEqual("Session not valid.");
                done();
            });
        });

        it("session success", (done) => {
            XCALL_SPYON.mockReturnValue(
                Promise.resolve({
                    userId: USER_ID,
                    time: Date.now(),
                }),
            );

            handleSession(SESSION_ID).then((user) => {
                expect(user).toEqual(USER_ID);
                done();
            }, done.fail);
        });
    });

    describe("handleSessionUser", () => {
        it("query return null", (done) => {
            XCALL_SPYON.mockReturnValue(Promise.resolve(null));

            handleSessionUser(USER_ID).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_NOT_FOUND);
                    expect(error.message).toEqual("User not valid.");
                    done();
                },
            );
        });

        it("user invalid", (done) => {
            XCALL_SPYON.mockReturnValue(
                Promise.resolve({
                    license: LICENSE_ID,
                }),
            );

            handleSessionUser(USER_ID).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_NOT_FOUND);
                    expect(error.message).toEqual("User not valid.");
                    done();
                },
            );
        });

        it("user invalid", (done) => {
            XCALL_SPYON.mockReturnValue(
                Promise.resolve({
                    name: "Test User",
                }),
            );

            handleSessionUser(USER_ID).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.code).toEqual(SERVICE_ERROR_CODES.USER_NOT_FOUND);
                    expect(error.message).toEqual("User not valid.");
                    done();
                },
            );
        });

        it("success", (done) => {
            XCALL_SPYON.mockReturnValue(
                Promise.resolve({
                    name: "Test User",
                    license: LICENSE_ID,
                }),
            );

            handleSessionUser(USER_ID).then((userInfo) => {
                expect(userInfo.name).toEqual("Test User");
                expect(userInfo.license).toEqual(LICENSE_ID);
                done();
            }, done.fail);
        });
    });

    describe("handleSessionIsAdminMode", () => {
        it("query return null", (done) => {
            XCALL_SPYON.mockReturnValue(Promise.resolve(null));

            handleSessionIsAdminMode(LICENSE_ID).then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error.code).toEqual(SERVICE_ERROR_CODES.LICENSE_ERROR);
                    expect(error.message).toEqual("license not valid.");
                    done();
                },
            );
        });

        it("success", (done) => {
            XCALL_SPYON.mockReturnValue(Promise.resolve({ admin: true }));

            handleSessionIsAdminMode(LICENSE_ID).then((adminInfo) => {
                expect(adminInfo.admin).toBeTruthy();
                done();
            }, done.fail);
        });
    });

    it("handleSessionPrivileges", (done) => {
        XCALL_SPYON.mockReturnValue(
            Promise.resolve([
                { name: "p1", read: 1, write: 1, delete: 1, change: 1, execute: 1 },
                { name: "p2", read: 1, write: 1, delete: 1, change: 1, execute: 1 },
                { name: "p3", read: 1, write: 1, delete: 1, change: 1, execute: 1 },
                { name: "p4", read: 1, write: 1, delete: 1, change: 1, execute: 1 },
                { name: "p5", read: 1, write: 1, delete: 1, change: 1, execute: 1 },
                { name: "p6", read: 1, write: 1, delete: 1, change: 1, execute: 1 },
                { name: "p7", read: 0, write: 0, delete: 0, change: 0, execute: 0 },
            ]),
        );

        handleSessionPrivileges(LICENSE_ID).then((result) => {
            expect(result["p1"]).toBeDefined();
            expect(result["p2"]).toBeDefined();
            expect(result["p3"]).toBeDefined();
            expect(result["p4"]).toBeDefined();

            expect(result["p1"].read).toEqual("allow");
            expect(result["p1"].write).toEqual("allow");
            expect(result["p1"].delete).toEqual("allow");
            expect(result["p1"].change).toEqual("allow");
            expect(result["p1"].execute).toEqual("allow");

            expect(result["p7"].read).toEqual("avoid");
            expect(result["p7"].write).toEqual("avoid");
            expect(result["p7"].delete).toEqual("avoid");
            expect(result["p7"].change).toEqual("avoid");
            expect(result["p7"].execute).toEqual("avoid");

            expect(result["p2"].read).toEqual("non");
            expect(result["p2"].write).toEqual("allow");
            expect(result["p2"].delete).toEqual("allow");
            expect(result["p2"].change).toEqual("allow");
            expect(result["p2"].execute).toEqual("allow");

            expect(result["p3"].read).toEqual("non");
            expect(result["p3"].write).toEqual("non");
            expect(result["p3"].delete).toEqual("allow");
            expect(result["p3"].change).toEqual("allow");
            expect(result["p3"].execute).toEqual("allow");

            expect(result["p4"].read).toEqual("non");
            expect(result["p4"].write).toEqual("non");
            expect(result["p4"].delete).toEqual("non");
            expect(result["p4"].change).toEqual("allow");
            expect(result["p4"].execute).toEqual("allow");

            expect(result["p5"].read).toEqual("non");
            expect(result["p5"].write).toEqual("non");
            expect(result["p5"].delete).toEqual("non");
            expect(result["p5"].change).toEqual("non");
            expect(result["p5"].execute).toEqual("allow");

            expect(result["p6"].read).toEqual("non");
            expect(result["p6"].write).toEqual("non");
            expect(result["p6"].delete).toEqual("non");
            expect(result["p6"].change).toEqual("non");
            expect(result["p6"].execute).toEqual("non");

            done();
        }, done.fail);
    });
});
