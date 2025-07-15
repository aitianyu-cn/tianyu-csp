/** @format */

import { ImportPackage } from "#interface";

export class PluginHandler {
    public static async handlePlguin<T>(data: T, plugins: ImportPackage[]): Promise<T> {
        let processedData: T = data;
        for (const plugin of plugins) {
            const processor = TIANYU.import(
                plugin.package || /* istanbul ignore next */ "",
                plugin.module || /* istanbul ignore next */ "",
            )?.[plugin.method || /* istanbul ignore next */ ""];

            /* istanbul ignore if */
            if (!processor) {
                break;
            }

            processedData = await processor(processedData);
        }

        return processedData;
    }
}
