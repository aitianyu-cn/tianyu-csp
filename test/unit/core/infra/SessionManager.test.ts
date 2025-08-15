/** @format */

import { BACKEND_SESSION_USER, GlobalSessionManager, SessionManager } from "#core/infra/SessionManager";
import { PROJECT_DEFAULT_LANGUAGE } from "packages/Common";
import * as SESSION_HANDLER from "#core/infra/code/SessionCodes";
import { AreaCode } from "@aitianyu.cn/types";

const SESSION_ID = "session_id";
const USER_ID = "test_user";
const LICENSE_ID = "test_license";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.SessionManager", () => {
    it("GlobalSessionManager", () => {
        const mgr = new GlobalSessionManager();

        expect(mgr.sessionId).toEqual("");
        expect(mgr.adminMode).toBeTruthy();
        expect(mgr.language).toEqual(PROJECT_DEFAULT_LANGUAGE);
        expect(mgr.defaultLanguage).toEqual(PROJECT_DEFAULT_LANGUAGE);
        expect(mgr.user).toEqual({ userId: BACKEND_SESSION_USER, displayName: "BACKEND" });
        expect(mgr.checkPrivilege("", "change")).toBeTruthy();
    });

    describe("SessionManager", () => {
        it("from query", async () => {
            jest.spyOn(SESSION_HANDLER, "handleSession").mockReturnValue(Promise.resolve(USER_ID));
            jest.spyOn(SESSION_HANDLER, "handleSessionUser").mockReturnValue(
                Promise.resolve({ name: "Test User", license: LICENSE_ID }),
            );
            jest.spyOn(SESSION_HANDLER, "handleSessionIsAdminMode").mockReturnValue(Promise.resolve({ admin: true }));
            jest.spyOn(SESSION_HANDLER, "handleSessionPrivileges").mockReturnValue(
                Promise.resolve({
                    p1: { read: "allow", write: "allow", delete: "avoid", change: "allow", execute: "allow" },
                    p2: { read: "allow", write: "allow", delete: "avoid", change: "allow", execute: "non" },
                }),
            );

            const mgr = new SessionManager({
                session: SESSION_ID,
                language: AreaCode.zh_CN,
            } as any);

            await mgr.loadData();

            expect(mgr.sessionId).toEqual(SESSION_ID);
            expect(mgr.adminMode).toBeTruthy();
            expect(mgr.language).toEqual(AreaCode.zh_CN);
            expect(mgr.defaultLanguage).toEqual(PROJECT_DEFAULT_LANGUAGE);
            expect(mgr.user).toEqual({ userId: USER_ID, displayName: "Test User" });

            expect(mgr.checkPrivilege("p1", "read")).toEqual("allow");
            expect(mgr.checkPrivilege("p1", "write")).toEqual("allow");
            expect(mgr.checkPrivilege("p1", "delete")).toEqual("avoid");
            expect(mgr.checkPrivilege("p1", "change")).toEqual("allow");
            expect(mgr.checkPrivilege("p1", "execute")).toEqual("allow");

            expect(mgr.checkPrivilege("p2", "read")).toEqual("allow");
            expect(mgr.checkPrivilege("p2", "write")).toEqual("allow");
            expect(mgr.checkPrivilege("p2", "delete")).toEqual("avoid");
            expect(mgr.checkPrivilege("p2", "change")).toEqual("allow");
            expect(mgr.checkPrivilege("p2", "execute")).toEqual("non");

            expect(mgr.checkPrivilege("p3", "read")).toEqual("non");
        });

        it("from job", async () => {
            const SPY = jest.spyOn(SESSION_HANDLER, "handleSession").mockReturnValue(Promise.resolve(USER_ID));
            jest.spyOn(SESSION_HANDLER, "handleSessionUser").mockReturnValue(
                Promise.resolve({ name: "Test User", license: LICENSE_ID }),
            );
            jest.spyOn(SESSION_HANDLER, "handleSessionIsAdminMode").mockReturnValue(Promise.resolve({ admin: true }));
            jest.spyOn(SESSION_HANDLER, "handleSessionPrivileges").mockReturnValue(
                Promise.resolve({
                    p1: { read: "allow", write: "allow", delete: "avoid", change: "allow", execute: "allow" },
                    p2: { read: "allow", write: "allow", delete: "avoid", change: "allow", execute: "non" },
                }),
            );

            const mgr = new SessionManager({
                userId: "test_Admin",
                language: AreaCode.zh_CN,
            } as any);

            await mgr.loadData();

            expect(SPY).not.toHaveBeenCalled();

            expect(mgr.sessionId).toEqual("");
            expect(mgr.adminMode).toBeTruthy();
            expect(mgr.language).toEqual(AreaCode.zh_CN);
            expect(mgr.defaultLanguage).toEqual(PROJECT_DEFAULT_LANGUAGE);
            expect(mgr.user).toEqual({ userId: "test_Admin", displayName: "Test User" });

            expect(mgr.checkPrivilege("p1", "read")).toEqual("allow");
            expect(mgr.checkPrivilege("p1", "write")).toEqual("allow");
            expect(mgr.checkPrivilege("p1", "delete")).toEqual("avoid");
            expect(mgr.checkPrivilege("p1", "change")).toEqual("allow");
            expect(mgr.checkPrivilege("p1", "execute")).toEqual("allow");

            expect(mgr.checkPrivilege("p2", "read")).toEqual("allow");
            expect(mgr.checkPrivilege("p2", "write")).toEqual("allow");
            expect(mgr.checkPrivilege("p2", "delete")).toEqual("avoid");
            expect(mgr.checkPrivilege("p2", "change")).toEqual("allow");
            expect(mgr.checkPrivilege("p2", "execute")).toEqual("non");

            expect(mgr.checkPrivilege("p3", "read")).toEqual("non");
        });
    });
});
