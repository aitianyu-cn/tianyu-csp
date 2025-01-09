/** @format */

import { IEnvironment } from "#interface";
import { PROJECT_ENVIRONMENT_MODE, PROJECT_NAME, PROJECT_ROOT_PATH, PROJECT_VERSION } from "packages/Common";

export class EnvironmentManager implements IEnvironment {
    public get baseUrl(): string {
        return PROJECT_ROOT_PATH;
    }
    public get version(): string {
        return PROJECT_VERSION;
    }
    public get development(): boolean {
        return PROJECT_ENVIRONMENT_MODE.toLowerCase() === "development";
    }
    public get name(): string {
        return PROJECT_NAME;
    }
}
