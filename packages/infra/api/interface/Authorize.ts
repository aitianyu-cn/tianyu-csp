/** @format */

import { OperationActions, RolePrivilegeType } from "./Declars";

export interface ILicensesDBRecord {
    id: string;
    name: string;
    desc: string;
    sys: boolean;
}

export type RolePrivilegeMap = { [key in OperationActions]: RolePrivilegeType };

export interface ITeamDBRecord {
    id: string;
    name: string;
    desc: string;
}
