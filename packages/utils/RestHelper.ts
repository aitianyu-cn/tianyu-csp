/** @format */

import { RequestRestData } from "#interface";
import { REST } from "../Common";

export class RestHelper {
    public static getRest(path: string): RequestRestData | null {
        if (!path || path === "/") return null;

        const restPath = path.startsWith("/") ? path : `/${path}`;
        const restData = REST[restPath];
        return restData?.package && restData?.module && restData?.method
            ? {
                  package: restData.package,
                  module: restData.module,
                  method: restData.method,
              }
            : null;
    }
}
