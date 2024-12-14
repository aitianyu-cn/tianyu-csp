/** @format */

import { NetworkServiceResponseData } from "#interface";

import * as HTML_LOADER from "./loader/HtmlLoader";

export async function html(): Promise<NetworkServiceResponseData> {
    return HTML_LOADER.loader();
}
