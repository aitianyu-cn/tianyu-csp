/** @format */

export * from "./interface/index";

import * as UtilsExport from "./utils/utils-export";
import * as CommonExport from "./core/Constant";
import * as InfraExport from "./core/index";

export namespace TianyuCSP {
    export import Utils = UtilsExport;
    export import Common = CommonExport;
    export import Infra = InfraExport;
}
