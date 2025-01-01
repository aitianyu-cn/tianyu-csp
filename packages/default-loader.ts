/** @format */

import { NetworkServiceResponseData } from "#interface";

import * as HTML_LOADER from "./loader/HtmlLoader";

/**
 * @internal
 *
 * To load a html file, the file path matches the url path.
 *
 * @returns return a network service valid response data and fill specified html data
 */
export async function html(): Promise<NetworkServiceResponseData> {
    return HTML_LOADER.loader();
}
