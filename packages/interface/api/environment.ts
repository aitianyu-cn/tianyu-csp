/** @format */

/** CSP environment config */
export interface IEnvironment {
    /** Customized Package entry path */
    baseUrl: string;
    /** application version */
    version: string;
    /** application runtime mode, indicate is development or not */
    development: boolean;
    /** application name */
    name: string;
}
