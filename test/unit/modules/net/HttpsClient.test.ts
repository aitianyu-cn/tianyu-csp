/** @format */

import { readFileSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { createServer, Server, ServerOptions } from "https";
import path from "path";
import { TimerTools } from "test/tools/TimerTools";
import { gzipSync } from "zlib";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.net.HttpsClient", () => {
    it("addCert", () => {
        const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "", "GET");
        client.addCert("cert1");
        client.addCert("cert2");
        client.addCert("cert3");

        expect(client["certs"]).toEqual(["cert1", "cert2", "cert3"]);
    });

    it("addCa", () => {
        const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "", "GET");
        client.addCa("ca1");
        client.addCa("ca2");
        client.addCa("ca3");

        expect(client["cas"]).toEqual(["ca1", "ca2", "ca3"]);
    });

    it("setRequireAuth", () => {
        const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "", "GET");
        expect(client["authorization"]).toBeTruthy();

        client.setRequireAuth(false);
        expect(client["authorization"]).toBeFalsy();
    });

    describe("transfer", () => {
        const cert = readFileSync(path.join(process.cwd(), ".config/localhost+2.pem"), "utf-8");
        let server: Server;

        const lisenter = jest.fn<void, [IncomingMessage, ServerResponse]>((_, res) => {
            res.statusCode = 200;
            res.write("hello world!");
            res.end();
        });

        beforeAll(async () => {
            const option: ServerOptions = {
                key: readFileSync(path.join(process.cwd(), ".config/localhost+2-key.pem"), "utf-8"),
                cert,
            };
            server = createServer(option, lisenter);
            server.listen(32001, "localhost");

            // waiting for server port established
            await TimerTools.sleep(1000);
        }, 50000);

        afterAll(async () => {
            server.close();

            // waiting for server closed
            await TimerTools.sleep(1000);
        }, 500000);

        it("http success 1", async () => {
            const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "", "GET");
            client.setPort(32001);
            client.addCert(cert);
            client.addCa(cert);
            client.setRequireAuth(false);

            lisenter.mockImplementation((req, res) => {
                res.setHeader("content-type", "text/plain");
                res.statusCode = 200;
                res.write("success");
                res.end();
            });

            await client.send();
            expect(client.raw).toEqual("success");
            expect(client.allHeaders()["content-type"]).toEqual("text/plain");
        });

        it("http success 2", async () => {
            const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "/test-path", "GET");
            client.setPort(32001);
            client.setCookie({ LANG: "zh_CN" });
            client.setHeader({ cookie: "SESSION=123456789;" });
            client.setParameter({ p1: ["p1"] });
            client.setRequireAuth(false);

            let path2 = "";
            let cookie = "";

            lisenter.mockImplementation((req, res) => {
                path2 = req.url || "";
                cookie = req.headers["cookie"] || "";

                res.statusCode = 200;
                res.write("success");
                res.end();
            });

            await client.send();

            expect(client.raw).toEqual("success");
            expect(path2).toEqual("/test-path?p1=p1");
            expect(cookie).toEqual("SESSION=123456789;LANG=zh_CN;");
        });

        it("http success 3 - post", async () => {
            const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "/test-path", "POST");
            client.setPort(32001);
            client.setBody({ test: "test" });
            client.setRequireAuth(false);

            let body = "";

            lisenter.mockImplementation((req, res) => {
                req.on("data", (chunk: any) => {
                    body += chunk;
                });

                req.on("end", () => {
                    res.statusCode = 200;
                    res.write("success");
                    res.end();
                });
            });

            await client.send();

            expect(client.raw).toEqual("success");
            expect(body).toEqual(JSON.stringify({ test: "test" }));
        });

        it("http success 4 - post", async () => {
            const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "/test-path", "POST");
            client.setPort(32001);
            client.setRequireAuth(false);

            let body = "";

            lisenter.mockImplementation((req, res) => {
                req.on("data", (chunk: any) => {
                    body += chunk;
                });

                req.on("end", () => {
                    res.statusCode = 200;
                    res.write("success");
                    res.end();
                });
            });

            await client.send();

            expect(client.raw).toEqual("success");
            expect(body).toEqual("");
        });

        it("http success 4 - gzip", async () => {
            const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "/test-path", "POST");
            client.setPort(32001);
            client.setRequireAuth(false);

            let body = "";

            lisenter.mockImplementation((req, res) => {
                req.on("data", (chunk: any) => {
                    body += chunk;
                });

                req.on("end", () => {
                    res.statusCode = 200;
                    res.setHeader("content-encoding", "gzip");
                    res.write(gzipSync("success"));
                    res.end();
                });
            });

            await client.send();

            expect(client.raw).toEqual("success");
            expect(body).toEqual("");
        });

        it("failed 1", (done) => {
            const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "", "GET");
            client.setPort(32001);
            client.setRequireAuth(false);

            lisenter.mockImplementation((req, res) => {
                res.statusCode = 404;
                res.write("failed");
                res.end();
            });

            client.send().then(
                () => {
                    done.fail();
                },
                (error) => {
                    expect(error).toEqual(404);
                    expect(client.raw).toEqual("failed");
                    done();
                },
            );
        });

        it("failed 2", (done) => {
            const client = new TIANYU.import.MODULE.Net.HttpsClient("localhost", "", "GET");
            client.setPort(10000);
            client.setRequireAuth(false);

            lisenter.mockImplementation((req, res) => {
                res.statusCode = 404;
                res.write("failed");
                res.end();
            });

            client.send().then(
                () => {
                    done.fail();
                },
                (_error) => {
                    expect(lisenter).not.toHaveBeenCalled();
                    done();
                },
            );
        });
    });
});
