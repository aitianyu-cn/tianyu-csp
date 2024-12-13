/** @format */

import fs from "fs";
import path from "path";
import { EXTERNAL_MODULE_ROOT_PATH, INTERNAL_PROJECT_ROOT } from "../../Common";
import { ErrorHelper } from "#utils/ErrorHelper";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { IImporter } from "#interface";

import * as MODULE_IMPORT from "#module/module-export";

const SUPPORTED_SUFFIX = ["", ".ts", ".js", ".json"];

export function importImpl(): IImporter {
    const importer = ((packageName: string, objectName: string) => {
        if (!packageName || !objectName) {
            throw ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, `import package and Object should not be empty`);
        }

        const isInternal = packageName.startsWith("$");
        const hasPrefix = isInternal || packageName.startsWith("#");
        const processedPackageName = hasPrefix ? packageName.substring(1) : packageName;

        const dir = path.resolve(
            isInternal ? INTERNAL_PROJECT_ROOT : EXTERNAL_MODULE_ROOT_PATH,
            processedPackageName.replace(/\./g, "/"),
        );

        let targetPath = "";
        for (const suffix of SUPPORTED_SUFFIX) {
            const newObjectPath = path.resolve(dir, `${objectName}${suffix}`);
            if (fs.existsSync(newObjectPath)) {
                targetPath = newObjectPath;
                break;
            }
        }

        if (!targetPath) {
            throw ErrorHelper.getError(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                `import package '${packageName}' and Object '${objectName}' from path ${dir} not found`,
            );
        }

        return require(targetPath);
    }) as IImporter;
    importer.MODULE = MODULE_IMPORT;

    return importer;
}
