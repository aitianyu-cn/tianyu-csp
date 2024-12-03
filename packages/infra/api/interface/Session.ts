/** @format */

import { AreaCode, MapOfType } from "@aitianyu.cn/types";
import { OperationActions } from "./Declars";

export interface ISessionUser {
    id: string;
    name: string;
    admin: boolean;
}

export interface ISessionInfo {
    id: string;
    user: ISessionUser;
    lang: AreaCode;
}

export interface ISessionPrivilege {
    read: boolean;
    write: boolean;
    delete: boolean;
    change: boolean;
    execute: boolean;
}

export interface ISessionManagerBase {
    getInfo(id: string): ISessionInfo;
    getPrivilege(userId: string): MapOfType<ISessionPrivilege>;
    checkPrivilege(userId: string, functionality: string, action: OperationActions): boolean;
}
