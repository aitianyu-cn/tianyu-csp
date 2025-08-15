/** @format */

import * as Http from "http";
import { HttpHelper } from "#utils";
import { HTTP_STATUS_CODE } from "#interface";
import { AbstractHttpClient } from "./AbstractHttpClient";
import { StringObj } from "#base/object/String";

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

                const stream = this.decodeStream(res, res.headers);
                stream.on("data", (chunk) => {
                    const data = chunk.toString("utf-8");
                    this.result += data;
                });
                stream.on("end", () => {
                    resolve();
                });
            });
            client.on("error", reject);

            if (this.method === "POST") {
                client.write(StringObj.stringifySafe(this.body || ""));
            }

            client.end();
        });
    }
}
