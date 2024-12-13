/** @format */

import { FunctionalityPrivilegeMap, SupportedDatabaseType } from "#interface";
import { getBoolean, MapOfType, StringHelper } from "@aitianyu.cn/types";
import { DATABASE_SYS_DB_MAP, SESSION_LIFE_TIME } from "../../../Common";
import { DEFAULT_SYS_DB_MAP } from "../Constant";
import { SERVICE_ERROR_CODES } from "#core/Constant";

const TemplateSQL: { [id: string]: { [key in SupportedDatabaseType]: string } } = {
    session: {
        mysql: "SELECT `{2}` as userId, `{3}` as time FROM `{0}`.`{1}` WHERE `{2}` = '{4}';",
    },
    user: {
        mysql: "SELECT `{2}` as name, `{3}` as license FROM `{0}`.`{1}` WHERE `{4}` = '{5}';",
    },
    license: {
        mysql: "SELECT `{2}` as admin FROM `{0}`.`{1}` WHERE `{3}` = '{4}';",
    },
    role: {
        mysql: "SELECT `{2}` as name, `{3}` as read, `{4}` as write, `{5}` as delete, `{6}` as change, `{7}` as execute FROM `{0}`.`{1}` WHERE `{8}` = '{9}';",
    },
};

export async function handleSession(sessionId: string): Promise<string> {
    const dbInfo = DATABASE_SYS_DB_MAP["session"] || /* istanbul ignore next */ DEFAULT_SYS_DB_MAP["session"];
    const connection = TIANYU.db.connect(dbInfo.database);
    const sessionInfo = await connection
        .query(
            StringHelper.format(TemplateSQL["session"][TIANYU.db.databaseType(connection.name)], [
                dbInfo.database,
                dbInfo.table,

                dbInfo.field.user,
                dbInfo.field.time,

                sessionId,
            ]),
        )
        .finally(() => {
            connection.close();
        });

    if (!Array.isArray(sessionInfo) || !sessionInfo.length) {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.USER_SESSION_NOT_VALID,
            message: "Session not valid.",
        });
    }

    const { userId, time } = sessionInfo[0];
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
    const dbInfo = DATABASE_SYS_DB_MAP["user"] || /* istanbul ignore next */ DEFAULT_SYS_DB_MAP["user"];
    const connection = TIANYU.db.connect(dbInfo.database);
    const userInfo = await connection
        .query(
            StringHelper.format(TemplateSQL["user"][TIANYU.db.databaseType(connection.name)], [
                dbInfo.database,
                dbInfo.table,

                dbInfo.field.name,
                dbInfo.field.license,
                dbInfo.field.id,

                user,
            ]),
        )
        .finally(() => {
            connection.close();
        });

    if (!Array.isArray(userInfo) || !userInfo.length) {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.USER_NOT_FOUND,
            message: "User not valid.",
        });
    }

    return userInfo[0];
}

export async function handleSessionIsAdminMode(license: string): Promise<{ admin: boolean }> {
    const dbInfo = DATABASE_SYS_DB_MAP["license"] || /* istanbul ignore next */ DEFAULT_SYS_DB_MAP["license"];
    const connection = TIANYU.db.connect(dbInfo.database);
    const licenseInfo = await connection
        .query(
            StringHelper.format(TemplateSQL["license"][TIANYU.db.databaseType(connection.name)], [
                dbInfo.database,
                dbInfo.table,

                dbInfo.field.admin,

                license,
            ]),
        )
        .finally(() => {
            connection.close();
        });

    if (!Array.isArray(licenseInfo) || !licenseInfo.length) {
        return Promise.reject({
            code: SERVICE_ERROR_CODES.LICENSE_ERROR,
            message: "license not valid.",
        });
    }

    return licenseInfo[0];
}
export async function handleSessionPrivileges(license: string): Promise<MapOfType<FunctionalityPrivilegeMap>> {
    const dbInfo = DATABASE_SYS_DB_MAP["role"] || /* istanbul ignore next */ DEFAULT_SYS_DB_MAP["role"];
    const connection = TIANYU.db.connect(dbInfo.database);
    const roleInfos = await connection
        .query(
            StringHelper.format(TemplateSQL["role"][TIANYU.db.databaseType(connection.name)], [
                dbInfo.database,
                dbInfo.table,

                dbInfo.field.name,
                dbInfo.field.read,
                dbInfo.field.write,
                dbInfo.field.delete,
                dbInfo.field.change,
                dbInfo.field.execute,

                dbInfo.field.lid,
                license,
            ]),
        )
        .finally(() => {
            connection.close();
        });

    const privileges: MapOfType<FunctionalityPrivilegeMap> = {};
    if (Array.isArray(roleInfos) && roleInfos.length) {
        for (const item of roleInfos) {
            privileges[item["name"]] = {
                read: getBoolean(item["read"]),
                write: getBoolean(item["write"]),
                delete: getBoolean(item["delete"]),
                change: getBoolean(item["change"]),
                execute: getBoolean(item["execute"]),
            };
        }
    }

    return privileges;
}
