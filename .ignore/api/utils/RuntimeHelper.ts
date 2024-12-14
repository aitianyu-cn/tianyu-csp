/** @format */

import { NODE_ENV_CONFIG_NAMES } from "../Constant";

export class RuntimeHelper {
    public static get isProduction(): boolean {
        return !!process.env[NODE_ENV_CONFIG_NAMES.ENVIRONMENT] || false;
    }
}
