/** @format */

import { IUsage, OperationActions } from "#interface";
import { TraceHelper } from "#utils/TraceHelper";
import { doXcall } from "./code/GenericXcall";

export class UsageManager implements IUsage {
    public async record(project: string, moduleOrFunctionName: string, action: OperationActions, msg?: string): Promise<void> {
        await doXcall(
            {
                user: TIANYU.session.user.userId,
                endpoint: `${project}#${moduleOrFunctionName}`,
                action: action,
                time: TraceHelper.generateTime(),
                message: msg || "",
            },
            "usage",
            "record",
            `Could not to record the usage for function '${moduleOrFunctionName}' in '${project}' project.`,
        );
    }
}
