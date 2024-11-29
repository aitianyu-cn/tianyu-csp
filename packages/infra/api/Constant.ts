/** @format */

import path from "path";

export type ProjectDefine = "core" | "data" | "infra" | "job" | "monitor" | "netword";

export type UsageAction = "Read" | "Write" | "Delete" | "Change" | "Execute";

export interface IFeaturesConfig {
    enable: boolean;
    description: string;
    dependency: string[];
}

export const DirectoryMap = {
    INFRA_RESOURCES: path.resolve(__dirname, "../resources"),
};
