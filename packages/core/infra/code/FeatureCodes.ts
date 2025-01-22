/** @format */

import { getBoolean } from "@aitianyu.cn/types";
import { doXcall } from "./GenericXcall";

export async function handleFeatureIsActive(feature: string): Promise<boolean> {
    const xcallResult = await doXcall(
        {
            id: feature,
        },
        "feature",
        "is-active",
        `Could not to read enablement status for feature '${feature}'.`,
    );

    return typeof xcallResult === "boolean" ? xcallResult : getBoolean(xcallResult);
}
