/** @format */

import * as Https from "https";
import { HttpHelper } from "#utils";
import { HTTP_STATUS_CODE, HttpCallMethod } from "#interface";
import { AbstractHttpClient } from "./AbstractHttpClient";

/**
 * Https Client
 *
 * To support a security http request connection
 */
export class HttpsClient extends AbstractHttpClient {
    private cas: string[];
    private certs: string[];

    private authorization: boolean;

    public constructor(locate: string, path: string, method: HttpCallMethod) {
        super(locate, path, method);

        this.authorization = true;
        this.cas = [];
        this.certs = [];
    }

    public addCert(cert: string): void {
        this.certs.push(cert);
    }

    public addCa(ca: string): void {
        this.cas.push(ca);
    }

    public setRequireAuth(requireAuth: boolean): void {
        this.authorization = requireAuth;
    }

    public async send(): Promise<void> {
        const header = this.header;
        const cookieStr = HttpHelper.stringifyCookie(this.cookies);
        header["cookie"] = `${header["cookie"] || ""}${cookieStr}`;

        const option: Https.RequestOptions = {
            host: this.locate,
            port: this.port,
            method: this.method,
            headers: header,
            path: `${this.path || "/"}${HttpHelper.stringifyParam(this.param)}`,
            ca: this.cas,
            cert: this.certs,
            rejectUnauthorized: this.authorization,
        };

        return new Promise<void>((resolve, reject) => {
            const client = Https.request(option, (res) => {
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
