/** @format */

import fs from "fs";
import path from "path";
import { EXTERNAL_MODULE_ROOT_PATH, INTERNAL_PROJECT_ROOT } from "../../Common";

const SUPPORTED_SUFFIX = ["", "js", "json"];

export function importImpl(packageName: string, objectName: string): any {
    if (!packageName || !objectName) {
        return null;
    }

    const isInternal = packageName.startsWith("$");
    const hasPrefix = isInternal || packageName.startsWith("#");
    const processedPackageName = hasPrefix ? packageName.substring(1) : packageName;

    const dir = path.resolve(
        isInternal ? INTERNAL_PROJECT_ROOT : EXTERNAL_MODULE_ROOT_PATH,
        processedPackageName.replace(/\./g, "/"),
        objectName,
    );

    let targetPath = "";
    for (const suffix of SUPPORTED_SUFFIX) {
        const newObjectPath = path.resolve(dir, `${objectName}${suffix}`);
        if (fs.existsSync(newObjectPath)) {
            targetPath = newObjectPath;
            break;
        }
    }

    return targetPath ? require(targetPath) : null;
}
