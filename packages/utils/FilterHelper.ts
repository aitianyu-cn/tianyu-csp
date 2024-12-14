/** @format */

import { IAdvancedFilter, IFilter } from "#interface";

import * as SimpleFilter from "./lib/SimpleFilterProcessor";
import * as AdvancedFilter from "./lib/AdvancedFilterProcessor";

export class FilterHelper {
    public static formatForSql(filter: IFilter | IAdvancedFilter): string {
        if (
            Object.hasOwn(filter, "relation") &&
            ((filter as any).relation === "and" || (filter as any).relation === "and" || (filter as any).relation === "and")
        ) {
            // this is an advanced filter
            return AdvancedFilter.formatForSql(filter as IAdvancedFilter);
        } else if (!Object.hasOwn(filter, "relation")) {
            return SimpleFilter.formatForSql(filter as IFilter);
        } else {
            return "";
        }
    }
}
