/** @format */

import { REST } from "#core/handler/RestHandlerConstant";
import { ImportPackage, PathEntry, RequestRestData } from "#interface";
import { MapOfType } from "@aitianyu.cn/types";

/**
 * @public
 *
 * Tianyu CSP Helper for Request
 */
export class RestHelper {
    /**
     * To get a request data from given url
     *
     * @param path the url of request
     * @param rest customized rest map
     * @param fallback customized rest fallback
     * @returns return a request rest data which defined in rest config,
     *          and null value will be returned if the url path is not mapped
     */
    public static getRest(path: string, rest?: MapOfType<ImportPackage>, fallback?: PathEntry): RequestRestData | null {
        if (!path) return null;

        const restPath = path.startsWith("/") ? path : `/${path}`;
        const restData = (rest ?? REST)[restPath];
        return restData?.package && restData?.module
            ? {
                  package: restData.package,
                  module: restData.module,
                  method: restData.method || "default",
              }
            : fallback || null;
    }
}
