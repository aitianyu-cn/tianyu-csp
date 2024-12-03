/** @format */

export * from "./api/Constant";

export * from "./api/interface/Database";
export * from "./api/interface/Declars";
export * from "./api/interface/FeatureMgr";
export * from "./api/interface/Logger";
export * from "./api/interface/Session";
export * from "./api/interface/Trace";
export * from "./api/interface/Usage";

export * from "./resources/InfraFeatures";

import * as LOG_HELPER from "./api/utils/LogHelper";
import * as RUNTIME_HELPER from "./api/utils/RuntimeHelper";
import * as TRACE_HELPER from "./api/utils/TraceHelper";

import * as LIFECYCLE from "./api/Lifecycle";

export namespace Infra {
    export import LogHelper = LOG_HELPER.LogHelper;
    export import RuntimeHelper = RUNTIME_HELPER.RuntimeHelper;
    export import TraceHelper = TRACE_HELPER.TraceHelper;

    export import register = LIFECYCLE.register;
    export import unregister = LIFECYCLE.unregister;
}
