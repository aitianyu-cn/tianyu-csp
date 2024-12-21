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
});
