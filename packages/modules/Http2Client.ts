/** @format */

import { AbstractHttpClient } from "./AbstractHttpClient";

export class Http2Client extends AbstractHttpClient {
    public send(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
