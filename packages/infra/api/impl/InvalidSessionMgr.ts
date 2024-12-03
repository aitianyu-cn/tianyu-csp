/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { OperationActions } from "../interface/Declars";
import { ISessionManagerBase, ISessionPrivilege, ISessionInfo } from "../interface/Session";

export class InvalidSessionMgr implements ISessionManagerBase {
    public getPrivilege(_userId: string): MapOfType<ISessionPrivilege> {
        throw new Error("Method not implemented.");
    }
    public checkPrivilege(_userId: string, _functionality: string, _action: OperationActions): boolean {
        throw new Error("Method not implemented.");
    }
    public getInfo(_id: string): ISessionInfo {
        throw new Error("Method not implemented.");
    }
}
