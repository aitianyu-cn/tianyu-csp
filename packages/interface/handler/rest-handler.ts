/** @format */

import { MapOfType } from "@aitianyu.cn/types";

export type SubitemType = "actual" | "param" | "generic";

export interface PathEntry {
    package: string;
    module: string;
    method: string;
}

export interface Subitem {
    id: string | null;

    actual: MapOfType<Subitem>;
    param: MapOfType<Subitem>;
    generic: Subitem | null;
}
