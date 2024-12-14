/** @format */

import { HTTP_STATUS_CODE } from "#interface";
import * as Http from "http";

export class HttpClient {
    private _url: any;
    private _data: string;

    public constructor(url: string) {
        this._url = url;
        this._data = "";
    }

    public async post(data?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client = Http.request(
                this._url,
                {
                    method: "POST",
                },
                (res) => {
                    if (res.statusCode !== HTTP_STATUS_CODE.OK) {
                        reject(res.statusCode);
                    }

                    res.on("data", (chunk) => {
                        this._data += chunk;
                    });
                    res.on("end", () => {
                        resolve(this._data);
                    });
                },
            );
            client.on("error", reject);
            client.write(JSON.stringify(data || ""));
            client.end();
        });
    }

    public async send(method: string, data?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client = Http.request(
                this._url,
                {
                    method,
                },
                (res) => {
                    if (res.statusCode !== HTTP_STATUS_CODE.OK) {
                        reject(res.statusCode);
                    }
                    res.on("data", (chunk) => {
                        this._data += chunk;
                    });
                    res.on("end", () => {
                        resolve(this._data);
                    });
                },
            );
            client.write(JSON.stringify(data || ""));
            client.end();
        });
    }

    public async get(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const client = Http.get(this._url, (res) => {
                if (res.statusCode !== HTTP_STATUS_CODE.OK) {
                    reject(res.statusCode);
                }

                res.on("data", (chunk) => {
                    this._data += chunk;
                });
                res.on("end", () => {
                    resolve(this._data);
                });
            });
            client.on("error", (error) => {
                console.log(error);
            });
            client.end();
        });
    }
}
