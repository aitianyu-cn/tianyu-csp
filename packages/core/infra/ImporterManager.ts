/** @format */

import fs from "fs";
import path from "path";
import { INTERNAL_PROJECT_ROOT, PROJECT_ROOT_PATH, PROJECT_ROOT_RELATION_PATH } from "../../Common";
import { ErrorHelper } from "#utils";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { DataEncoding, IImporter } from "#interface";

import * as MODULE_IMPORT from "#module";
import { SUPPORTED_SUFFIX } from "./Constant";

const SUPPORTED_HTML_SUFFIX = ["", ".html", ".htm", "/index.html", "/index.htm"];

/** CSP Import Manager Implementation for global definition */
export function importImpl(): IImporter {
    const importer = ((packageName: string, objectName: string) => {
        if (!packageName || !objectName) {
            throw ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, `import package and Object should not be empty`);
        }

        const dir = _handlePackage(packageName, objectName, PROJECT_ROOT_RELATION_PATH);
        const targetPath = findActualModule(dir);
        if (!targetPath) {
            throw ErrorHelper.getError(
                SERVICE_ERROR_CODES.INTERNAL_ERROR,
                `import package '${packageName}' and Object '${objectName}' from path ${dir} not found`,
            );
        }

        return require(targetPath);
    }) as IImporter;
    importer.MODULE = MODULE_IMPORT;
    importer.html = (file: string, encoding: DataEncoding = "utf-8"): string => {
        if (!file) {
            return "";
        }

        const dir = _handlePackage(file, "");
        const targetPath = _findFileWithSuffix(dir, SUPPORTED_HTML_SUFFIX);
        const result = targetPath ? fs.readFileSync(targetPath, encoding) : "";
        return result;
    };

    return importer;
}

/**
 * To find an actual module full path from src.
 * function will add suffix at the end of src path and to filter the module which is valid.
 *
 * @param src source module path
 * @returns return module full path with suffix, empty string value will be returned if the module could not be found
 */
export function findActualModule(src: string): string {
    return _findFileWithSuffix(src, SUPPORTED_SUFFIX);
}

function _handlePackage(packageName: string, objectName: string, externalPath?: string): string {
    const isInternal = packageName.startsWith("$");
    const hasPrefix = isInternal || packageName.startsWith("#");
    const processedPackageName = hasPrefix ? packageName.substring(1) : packageName;

    const dir = path.join(
        isInternal ? INTERNAL_PROJECT_ROOT : PROJECT_ROOT_PATH,
        (!isInternal && externalPath) || "",
        processedPackageName.replace(/\./g, "/"),
        objectName,
    );

    return dir;
}

function _findFileWithSuffix(src: string, suffixs: string[]): string {
    let targetPath = "";
    for (const suffix of suffixs) {
        const newObjectPath = `${src}${suffix}`;
        if (fs.existsSync(newObjectPath)) {
            const fileInfo = fs.statSync(newObjectPath);
            if (fileInfo.isFile()) {
                targetPath = newObjectPath;
                break;
            }
        }
    }
    return targetPath;
}
