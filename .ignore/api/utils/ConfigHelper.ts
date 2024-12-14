/** @format */

import fs from "fs";
import { IGlobalEnvironmentConfig } from "../interface/Declars";
import path from "path";

const _configCache: {
    config: IGlobalEnvironmentConfig;
    inited: boolean;
} = {
    config: {
        baseUrl: process.cwd(),
    },
    inited: false,
};

function initConfig(): void {
    const filePath = path.join(process.cwd(), "tianyu-csp.config.json");
    if (fs.statSync(filePath).isFile()) {
        const file = require(filePath);
        processConfig(file);
    }

    _configCache.inited = true;
}

function processConfig(config: any): void {
    _configCache.config.baseUrl = path.resolve(process.cwd(), config?.baseUrl || "");
}

export class ConfigHelper {
    public static get baseUrl(): string {
        if (!_configCache.inited) {
            initConfig();
        }
        return _configCache.config.baseUrl;
    }
}
