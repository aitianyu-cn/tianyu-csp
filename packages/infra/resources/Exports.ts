/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { IFeaturesConfig } from "../api/Constant";

/**
 * Exported Tianyu CSP Features for Infra structure used
 *
 * TIANYU_CSP_CORE: Tianyu CSP core functionality.
 * USAGE_TRACK_ENABLEMENT: to enable usage tracking when feature toggle to be true.
 * TRACE_CONSOLE_LOG_ENABLEMENT: to enbale trace tracking console log when toggle to be true
 */
export const INFRA_FEATURES: MapOfType<IFeaturesConfig> = require("./FeatureToggle.json");
