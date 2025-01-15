/** @format */

import * as Http from "http";
import { HttpHelper } from "#utils";
import { HTTP_STATUS_CODE } from "#interface";
import { AbstractHttpClient } from "./AbstractHttpClient";

/**
 * Http Client
 *
 * To support a non-authorized http request connection
 */
export class HttpClient extends AbstractHttpClient {
    public async send(): Promise<void> {
        const header = this.header;
        const cookieStr = HttpHelper.stringifyCookie(this.cookies);
        header["cookie"] = `${header["cookie"] || ""}${cookieStr}`;

        const option: Http.RequestOptions = {
            host: this.locate,
            port: this.port,
            method: this.method,
            headers: header,
            path: `${this.path || "/"}${HttpHelper.stringifyParam(this.param)}`,
        };

        return new Promise<void>((resolve, reject) => {
            const client = Http.request(option, (res) => {
                this.responseHeaders = res.headers;
                if (res.statusCode !== HTTP_STATUS_CODE.OK) {
                    reject(res.statusCode);
                }

                res.on("data", (chunk) => {
                    this.result += chunk;
                });
                res.on("end", () => {
                    resolve();
                });
            });
            client.on("error", reject);

            if (this.method === "POST") {
                client.write(JSON.stringify(this.body || ""));
            }

            client.end();
        });
    }
}
