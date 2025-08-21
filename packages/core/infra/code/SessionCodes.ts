/** @format */

import { FunctionalityPrivilegeMap } from "#interface";
import { getBoolean, MapOfType } from "@aitianyu.cn/types";
import { SYSTEM_PRIVILEGE_MAP } from "../../../Common";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { doXcall } from "./GenericXcall";
import { MessageBundle } from "#base/res/InternalMessageBundle";

export async function handleSession(sessionId: string): Promise<string> {
    const xcallResult = await doXcall(
        {
            id: sessionId,
        },
        "session",
        "get",
        MessageBundle.text("ERROR_CORE_INFRA_CODE_SESSION_ID_ERROR", sessionId),
    );

    const userId = xcallResult?.userId || "";
    const valid = xcallResult?.valid || false;
    if (!userId) {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.USER_SESSION_NOT_VALID,
            message: MessageBundle.text("ERROR_CORE_INFRA_CODE_SESSION_INVALID"),
        });
    }
    if (!valid) {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.USER_SESSION_OUT_OF_TIME,
            message: MessageBundle.text("ERROR_CORE_INFRA_CODE_SESSION_INVALID"),
        });
    }

    return userId;
}

export async function handleSessionUser(user: string): Promise<{ name: string; license: string }> {
    const xcallResult = await doXcall(
        {
            id: user,
        },
        "user",
        "get",
        MessageBundle.text("ERROR_CORE_INFRA_CODE_SESSION_USER_ID_ERROR", user),
    );

    const userName = xcallResult?.name;
    const license = xcallResult?.license;
    if (typeof userName !== "string" || typeof license !== "string") {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.USER_NOT_FOUND,
            message: MessageBundle.text("ERROR_CORE_INFRA_CODE_SESSION_USER_INVALID"),
        });
    }

    return { name: userName, license };
}

export async function handleSessionIsAdminMode(license: string): Promise<{ admin: boolean }> {
    const xcallResult = await doXcall(
        {
            id: license,
        },
        "license",
        "get",
        MessageBundle.text("ERROR_CORE_INFRA_CODE_SESSION_LICENSE_ERROR", license),
    );

    const isAdmin = xcallResult?.admin;
    if (typeof isAdmin !== "boolean") {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.LICENSE_ERROR,
            message: MessageBundle.text("ERROR_CORE_INFRA_CODE_SESSION_LICENSE_INVALID"),
        });
    }

    return { admin: isAdmin };
}
export async function handleSessionPrivileges(license: string): Promise<MapOfType<FunctionalityPrivilegeMap>> {
    const xcallResult = await doXcall(
        {
            id: license,
        },
        "role",
        "get",
        MessageBundle.text("ERROR_CORE_INFRA_CODE_SESSION_PRIVILEGE_ERROR", license),
    );

    const privileges: MapOfType<FunctionalityPrivilegeMap> = {};
    if (Array.isArray(xcallResult) && xcallResult.length) {
        for (const item of xcallResult) {
            const privilegeDef = SYSTEM_PRIVILEGE_MAP[item["name"]];
            if (privilegeDef) {
                privileges[item["name"]] = {
                    read: privilegeDef.read ? (getBoolean(item["read"]) ? "allow" : "avoid") : "non",
                    write: privilegeDef.write ? (getBoolean(item["write"]) ? "allow" : "avoid") : "non",
                    delete: privilegeDef.delete ? (getBoolean(item["delete"]) ? "allow" : "avoid") : "non",
                    change: privilegeDef.change ? (getBoolean(item["change"]) ? "allow" : "avoid") : "non",
                    execute: privilegeDef.execute ? (getBoolean(item["execute"]) ? "allow" : "avoid") : "non",
                };
            }
        }
    }

    return privileges;
}
