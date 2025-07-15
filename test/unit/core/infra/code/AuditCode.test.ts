/** @format */

import * as AuditCode from "#core/infra/code/AuditCode";
import { TcpService } from "#core/service/TcpService";
import { UdpService } from "#core/service/UdpService";
import { ISocketAddress } from "#interface";
import { createServer } from "@aitianyu.cn/server-base";
import { IncomingMessage, ServerResponse } from "http";
import { PROJECT_NAME } from "packages/Common";

describe("aitianyu-cn.node-module.tianyu-csp.unit.core.infra.code.AuditCodes", () => {
    it("handleAuditRecord", async () => {
        jest.spyOn(AuditCode, "audit4HTTP");
        jest.spyOn(AuditCode, "audit4UDP");
        jest.spyOn(AuditCode, "audit4TCP").mockImplementation(() => Promise.resolve());

        await AuditCode.handleAuditRecord([]);
    });

    it("audit4UDP", async () => {
        const service = new UdpService({
            address: "0.0.0.0",
            port: 514,
        });
        await new Promise<void>((resolve) => {
            service.listen(() => {
                setTimeout(() => {
                    resolve();
                }, 1000);
            });
        });

        const received = new Promise<void>((resolve) => {
            service.onData = (_, data) => {
                expect(data.toString("utf-8")).toEqual(`[DEBUG] --- 111 --- ${PROJECT_NAME} --- a --- test`);
                resolve();
            };
        });

        const remote: ISocketAddress = {
            address: "127.0.0.1",
            port: 514,
        };
        AuditCode.audit4UDP(remote, "IPv4", [
            {
                level: "DEBUG",
                timestamp: "111",
                app: "a",
                message: "test",
                additionalData: {},
            },
        ]);

        await received;
        await new Promise<void>((resolve) => {
            service.close(() => {
                setTimeout(() => {
                    resolve();
                }, 1000);
            });
        });
    }, 30000);

    describe("audit4TCP", () => {
        it("has additional data", async () => {
            const service = new TcpService({
                address: "0.0.0.0",
                port: 514,
            });
            await new Promise<void>((resolve) => {
                service.listen(() => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
            });

            const received = new Promise<void>((resolve) => {
                service.onData = (_, data) => {
                    expect(data.toString("utf-8")).toEqual(`[DEBUG] --- 222 --- ${PROJECT_NAME} --- a --- test --- {}`);
                    resolve();
                };
            });

            const remote: ISocketAddress = {
                address: "127.0.0.1",
                port: 514,
            };
            AuditCode.audit4TCP(remote, "IPv4", [
                {
                    level: "DEBUG",
                    timestamp: "222",
                    app: "a",
                    message: "test",
                    additionalData: {},
                },
            ]);

            await received;
            await new Promise<void>((resolve) => {
                service.close(() => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
            });
        }, 30000);

        it("not additional data", async () => {
            const service = new TcpService({
                address: "0.0.0.0",
                port: 514,
            });
            await new Promise<void>((resolve) => {
                service.listen(() => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
            });

            const received = new Promise<void>((resolve) => {
                service.onData = (_, data) => {
                    expect(data.toString("utf-8")).toEqual(`[DEBUG] --- 222 --- ${PROJECT_NAME} --- a --- test`);
                    resolve();
                };
            });

            const remote: ISocketAddress = {
                address: "127.0.0.1",
                port: 514,
            };
            AuditCode.audit4TCP(remote, "IPv4", [
                {
                    level: "DEBUG",
                    timestamp: "222",
                    app: "a",
                    message: "test",
                    additionalData: null,
                },
            ]);

            await received;
            await new Promise<void>((resolve) => {
                service.close(() => {
                    setTimeout(() => {
                        resolve();
                    }, 1000);
                });
            });
        }, 30000);
    });

    it("audit4HTTP", async () => {
        const handler = {
            get: jest.fn(),
            post: jest.fn(),
            error: jest.fn(),
        };
        const service = createServer(handler.get, handler.post, handler.error);

        const received = new Promise<void>((resolve) => {
            handler.post.mockImplementation((req: IncomingMessage, res: ServerResponse) => {
                let data: any = "";
                req.on("data", (chunk) => {
                    data += chunk;
                });
                req.on("end", () => {
                    const rec = JSON.parse(data);
                    expect(rec.length).toEqual(1);
                    expect(rec[0].level).toEqual("DEBUG");
                    expect(rec[0].timestamp).toEqual("111");
                    expect(rec[0].app).toEqual("a");
                    expect(rec[0].message).toEqual("test");
                    expect(rec[0].additionalData).toEqual({ test1: true, test2: "123" });
                    res.end();
                    resolve();
                });
            });
        });

        service.listen(514, "0.0.0.0");
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });

        const remote: ISocketAddress = {
            address: "127.0.0.1",
            port: 514,
        };
        AuditCode.audit4HTTP(remote, "/", {}, "http", [
            {
                level: "DEBUG",
                timestamp: "111",
                app: "a",
                message: "test",
                additionalData: { test1: true, test2: "123" },
            },
        ]);

        await received;
        await new Promise<void>((resolve) => {
            service.close(() => {
                setTimeout(() => {
                    resolve();
                }, 1000);
            });
        });
    }, 30000);
});
