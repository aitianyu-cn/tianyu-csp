/** @format */

import { getBoolean } from "@aitianyu.cn/types";
import { doXcall } from "./GenericXcall";
import { MessageBundle } from "#base/res/InternalMessageBundle";

export async function handleFeatureIsActive(feature: string): Promise<boolean> {
    const xcallResult = await doXcall(
        {
            id: feature,
        },
        "feature",
        "is-active",
        MessageBundle.text("ERROR_CORE_INFRA_CODE_FEATURE_FAILED", feature),
    );

    return typeof xcallResult === "boolean" ? xcallResult : getBoolean(xcallResult);
}
