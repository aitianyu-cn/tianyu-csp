/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { IUsage, OperationActions } from "#interface";
import { TraceHelper } from "#utils";
import { doXcall } from "./code/GenericXcall";

/** CSP Usage Manager for global definition */
export class UsageManager implements IUsage {
    /**
     * To record a usage action for giving project and found
     *
     * @param project used project name
     * @param moduleOrFunctionName used project function name, module name or data name
     * @param action function, module or data operation action type
     * @param msg additional message
     */
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
            MessageBundle.text("ERROR_CORE_INFRA_USAGE_MGR_FAILED", moduleOrFunctionName, project),
        );
    }
}
