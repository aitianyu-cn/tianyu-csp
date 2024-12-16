/** @format */

import fs from "fs";
import path from "path";
import { EXTERNAL_MODULE_ROOT_PATH, INTERNAL_PROJECT_ROOT } from "../../Common";
import { ErrorHelper } from "#utils/ErrorHelper";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { DataEncoding, IImporter } from "#interface";

import * as MODULE_IMPORT from "#module/module-export";
import { SUPPORTED_SUFFIX } from "./Constant";

const SUPPORTED_HTML_SUFFIX = ["", ".html", ".htm", "/index.html", "/index.htm"];

const DEFAULT_EMPTY_HTML = `<!DOCTYPE html><html lang="en"><head></head><body></body></html>`;

export function importImpl(): IImporter {
    const importer = ((packageName: string, objectName: string) => {
        if (!packageName || !objectName) {
            throw ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, `import package and Object should not be empty`);
        }

        const dir = _handlePackage(packageName, objectName);
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
        const result = targetPath ? fs.readFileSync(targetPath, encoding) : DEFAULT_EMPTY_HTML;
        return result;
    };

    return importer;
}

export function findActualModule(src: string): string {
    return _findFileWithSuffix(src, SUPPORTED_SUFFIX);
}

function _handlePackage(packageName: string, objectName: string): string {
    const isInternal = packageName.startsWith("$");
    const hasPrefix = isInternal || packageName.startsWith("#");
    const processedPackageName = hasPrefix ? packageName.substring(1) : packageName;

    const dir = path.join(
        isInternal ? INTERNAL_PROJECT_ROOT : EXTERNAL_MODULE_ROOT_PATH,
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
