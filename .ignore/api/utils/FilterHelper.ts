/** @format */

import { IAdvancedFilter, IFilter, IFilterFormatConfig } from "../interface/Filter";
import { IRuntimeManager } from "../interface/RuntimeMgr";

export class FilterHelper {
    public static format(runtime: IRuntimeManager, filter?: IFilter | IAdvancedFilter, config?: IFilterFormatConfig): string {
        //adminMode ? "true" : "`user` = '" + user.id + "'",
        throw new Error();
    }
}
