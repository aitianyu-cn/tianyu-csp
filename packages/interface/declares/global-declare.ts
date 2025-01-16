/** @format */

import { IGlobalDefinition } from "../Global";

declare global {
    /** Tianyu CSP global instances */
    export const TIANYU: IGlobalDefinition;

    // ####################################################################
    // Test only used flags
    // ####################################################################

    /**
     * Tianyu CSP Test flag to bypass the https/http2 sec-connection authorization check
     *
     * @warn This flag is only used in Tianyu-CSP Unit Test
     */
    export const TIANYU_TEST_HTTPS_UNAUTH: boolean;
}
