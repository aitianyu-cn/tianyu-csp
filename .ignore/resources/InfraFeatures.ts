/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { IFeaturesConfig } from "../api/interface/FeatureMgr";

/**
 * Exported Tianyu CSP Features for Infra structure used
 *
 * TIANYU_CSP_CORE: Tianyu CSP core functionality.
 * USAGE_TRACK_ENABLEMENT: to enable usage tracking when feature toggle to be true.
 * TRACE_CONSOLE_LOG_ENABLEMENT: to enbale trace tracking console log when toggle to be true
 */
export const INFRA_FEATURES = {
    TIANYU_CSP_CORE: {
        description: "Tianyu CSP core functionality",
        enable: true,
        dependency: [],
    },
    USAGE_TRACK_ENABLEMENT: {
        description: "Tianyu CSP usage tracking enablement toggle",
        enable: true,
        dependency: ["TIANYU_CSP_CORE"],
    },
    TRACE_CONSOLE_LOG_ENABLEMENT: {
        description: "Tianyu CSP trace recording local console log enablement",
        enable: true,
        dependency: ["TIANYU_CSP_CORE"],
    },
};

INFRA_FEATURES as MapOfType<IFeaturesConfig>;
