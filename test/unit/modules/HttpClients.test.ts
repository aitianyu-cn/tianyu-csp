/** @format */

import { readFileSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { Server, ServerOptions, createServer } from "https";
import path from "path";
import { TimerTools } from "test/tools/TimerTools";

describe("aitianyu-cn.node-module.tianyu-csp.unit.modules.HttpsClient", () => {
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
        // waiting for server closed
        // await TimerTools.sleep(50000);
        server.close();

        // waiting for server closed
        await TimerTools.sleep(1000);
    }, 500000);

    it("http success 1", async () => {
        const client = new TIANYU.import.MODULE.HttpsClient("localhost", "", "GET");
        client.setPort(32001);
        client.addCert(cert);
        client.setRequireAuth(false);

        lisenter.mockImplementation((req, res) => {
            res.statusCode = 200;
            res.write("success");
            res.end();
        });

        await client.send();
        expect(client.raw).toEqual("success");
    });

    it("http success 2", async () => {
        const client = new TIANYU.import.MODULE.HttpsClient("localhost", "/test-path", "GET");
        client.setPort(32001);
        client.setCookie({ LANG: "zh_CN" });
        client.setHeader({ cookie: "SESSION=123456789;" });
        client.setParameter({ p1: "p1" });
        client.setRequireAuth(false);

        let path = "";
        let cookie = "";

        lisenter.mockImplementation((req, res) => {
            path = req.url || "";
            cookie = req.headers["cookie"] || "";

            res.statusCode = 200;
            res.write("success");
            res.end();
        });

        await client.send();

        expect(client.raw).toEqual("success");
        expect(path).toEqual("/test-path?p1=p1");
        expect(cookie).toEqual("SESSION=123456789;LANG=zh_CN;");
    });

    it("http success 3 - post", async () => {
        const client = new TIANYU.import.MODULE.HttpsClient("localhost", "/test-path", "POST");
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
        const client = new TIANYU.import.MODULE.HttpsClient("localhost", "/test-path", "POST");
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
        expect(body).toEqual(JSON.stringify(""));
    });

    it("failed 1", (done) => {
        const client = new TIANYU.import.MODULE.HttpsClient("localhost", "", "GET");
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
        const client = new TIANYU.import.MODULE.HttpsClient("localhost", "", "GET");
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
            (error) => {
                expect(lisenter).not.toHaveBeenCalled();
                done();
            },
        );
    });
});
