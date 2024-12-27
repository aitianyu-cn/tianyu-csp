/** @format */

import { FunctionalityPrivilegeMap } from "#interface";
import { getBoolean, MapOfType } from "@aitianyu.cn/types";
import { SESSION_LIFE_TIME, SYSTEM_PRIVILEGE_MAP } from "../../../Common";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { doXcall } from "./GenericXcall";

export async function handleSession(sessionId: string): Promise<string> {
    const xcallResult = await doXcall(
        {
            id: sessionId,
        },
        "session",
        "get",
        `Could not to read session info for session '${sessionId}'.`,
    );

    const userId = xcallResult?.userId || "";
    const time = xcallResult?.time || "";
    if (!userId) {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.USER_SESSION_NOT_VALID,
            message: "Session not valid.",
        });
    }
    const dateTime = new Date(time);
    const timespan = (Date.now() - dateTime.getTime()) / 1000 / 60;
    if (timespan > SESSION_LIFE_TIME) {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.USER_SESSION_OUT_OF_TIME,
            message: "Session not valid.",
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
        `Could not to read user info for user '${user}'.`,
    );

    const userName = xcallResult?.name;
    const license = xcallResult?.license;
    if (typeof userName !== "string" || typeof license !== "string") {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.USER_NOT_FOUND,
            message: "User not valid.",
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
        `Could not to read license info for license '${license}'.`,
    );

    const isAdmin = xcallResult?.admin;
    if (typeof isAdmin !== "boolean") {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.LICENSE_ERROR,
            message: "license not valid.",
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
        `Could not to read role info for license '${license}'.`,
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
