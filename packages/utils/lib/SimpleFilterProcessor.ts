/** @format */

import { IFilter } from "#interface";
import { processValue } from "./SqlProcessor";

export function formatForSql(filter: IFilter): string {
    if (!filter.field || !filter.selection.length) {
        return "";
    }

    if (filter.selection.length === 1) {
        // only one member, format tobe equals
        return `${filter.field} ${filter.exclude ? "<>" : "="} ${processValue(filter.selection[0])}`;
    }
    if (filter.selection.length === 2 && filter.range) {
    }

    return "";
}
