/** @format */

import { MapOfType } from "@aitianyu.cn/types";

export interface ImportCacheOption {
    timeout: number;
}

export class ImportCache {
    private _timeout: number;
    private _cache: MapOfType<{ path: string; timestamp: number }>;

    public constructor(option?: ImportCacheOption) {
        this._timeout = option?.timeout || -1;
        this._cache = {};
    }

    public cache(packageName: string, objectName: string, path: string): void {
        this._cache[this.generateKey(packageName, objectName)] = { path, timestamp: Date.now() };
    }

    public get(packageName: string, objectName: string): string {
        const key = this.generateKey(packageName, objectName);
        const path = this._cache[key];
        if (!path) {
            return "";
        }

        if (this.checkTimeout(path.timestamp)) {
            this._removeInternal(key);
            return "";
        }

        return path.path;
    }

    public remove(packageName: string, objectName: string): void {
        this._removeInternal(this.generateKey(packageName, objectName));
    }

    private _removeInternal(key: string): void {
        this._cache[key] && delete this._cache[key];
    }

    private generateKey(packageName: string, objectName: string): string {
        return `[${packageName}]-[${objectName}]`;
    }
    private checkTimeout(timestamp: number): boolean {
        if (this._timeout === -1) {
            return false;
        }
        return Date.now() - timestamp > this._timeout;
    }
}
