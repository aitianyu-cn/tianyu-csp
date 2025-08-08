/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { ILifecycle, IReleasable } from "packages/interface/api/lifecycle";

export class LifecycleManager implements ILifecycle {
    private _instances: MapOfType<IReleasable>;

    public constructor() {
        this._instances = {};
    }

    public join(obj: IReleasable): void {
        if (this._instances[obj.id]) {
            void this._instances[obj.id].close();
        }

        this._instances[obj.id] = obj;
    }

    public leave(id: string): IReleasable | null {
        if (this._instances[id]) {
            const ins = this._instances[id];
            delete this._instances[id];
            return ins;
        }
        return null;
    }

    public async recycle(): Promise<void> {
        const released = this._instances;
        this._instances = {};

        const releasePromise: Promise<void>[] = [];
        for (const id of Object.keys(released)) {
            releasePromise.push(
                new Promise<void>(async (resolve, reject) => {
                    try {
                        await released[id].close();
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                }).catch((error) => {
                    void TIANYU.audit.error(`lifecycle/${id}`, "object lifecyle failed.", {
                        error: error?.message || "",
                        stack: error?.stack || "",
                    });
                }),
            );
        }

        await Promise.all(releasePromise);
    }
}
