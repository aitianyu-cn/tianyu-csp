/** @format */

import * as Https from "https";
import { HttpHelper } from "#utils";
import { HTTP_STATUS_CODE, HttpCallMethod } from "#interface";
import { AbstractHttpClient } from "./AbstractHttpClient";
import { StringObj } from "#base/object/String";

/**
 * Https Client
 *
 * To support a security http request connection
 */
export class HttpsClient extends AbstractHttpClient {
    private cas: string[];
    private certs: string[];

    private authorization: boolean;

    /**
     * Create a Https Client
     *
     * @param locate Remote host
     * @param path connection path
     * @param method request method
     */
    public constructor(locate: string, path: string, method: HttpCallMethod) {
        super(locate, path, method);

        this.authorization = HttpHelper.shouldRejectUnauth();
        this.cas = [];
        this.certs = [];
    }

    /**
     * To add a cert into client connection
     *
     * @param cert new cert
     */
    public addCert(cert: string): void {
        this.certs.push(cert);
    }
    /**
     * To add a ca into client connection
     *
     * @param ca new ca
     */
    public addCa(ca: string): void {
        this.cas.push(ca);
    }
    /**
     * Set the connection should validate the cert
     *
     * @param requireAuth flag of auth checking
     */
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
            ca: this.cas.length ? this.cas : undefined,
            cert: this.certs.length ? this.certs : undefined,
            rejectUnauthorized: this.authorization,
        };

        return new Promise<void>((resolve, reject) => {
            const client = Https.request(option, (res) => {
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
