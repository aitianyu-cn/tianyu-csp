/** @format */

import { REST } from "#core/handler/RestHandlerConstant";
import { RequestRestData } from "#interface";

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
     * @returns return a request rest data which defined in rest config,
     *          and null value will be returned if the url path is not mapped
     */
    public static getRest(path: string): RequestRestData | null {
        if (!path) return null;

        const restPath = path.startsWith("/") ? path : `/${path}`;
        const restData = REST[restPath];
        return restData?.package && restData?.module
            ? {
                  package: restData.package,
                  module: restData.module,
                  method: restData.method || "default",
              }
            : null;
    }
}
