/** @format */

import { NetworkServiceResponseData } from "#interface";

import * as HTML_LOADER from "./loader/HtmlLoader";
import * as PROXY_LOADER from "./loader/ProxyLoader";

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

/**
 * @internal
 *
 * To execute a remote proxy.
 *
 * @returns return a network service valid response data from remote proxy returns
 */
export async function proxy(): Promise<NetworkServiceResponseData> {
    return PROXY_LOADER.loader();
}
