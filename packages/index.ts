/** @format */

/**
 * @public
 *
 * Tianyu CSP Generic Exporter
 *
 * To export all Tianyu CSP public functions, classes, interfaces
 * and tools.
 */

/** export all interfaces */
export * from "./interface/index";

import * as UtilsExport from "./utils/utils-export";
import * as CommonExport from "./core/Constant";
import * as InfraExport from "./core/index";

/** namespace for Tianyu CSP */
export namespace TianyuCSP {
    /** CSP utils */
    export import Utils = UtilsExport;
    /** CSP Common Data */
    export import Common = CommonExport;
    /** CSP Infra components */
    export import Infra = InfraExport;
}
