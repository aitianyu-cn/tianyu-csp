/** @format */

import { REST } from "#core/handler/RestHandlerConstant";
import { RequestRestData } from "#interface";

export class RestHelper {
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
