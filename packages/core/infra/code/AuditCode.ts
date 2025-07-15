/** @format */

import { HttpProtocal, ISocketAddress, SocketAddressFamily } from "#interface";
import { MapOfType } from "@aitianyu.cn/types";
import { AUDIT_CONFIGURATION, PROJECT_NAME } from "packages/Common";
import { HTTP_CLIENT_MAP } from "packages/modules/Constant";

export interface IAuditRecordBuffer {
    timestamp: string;
    app: string;
    message: string;
    level: string;
    additionalData: any;
}

export async function handleAuditRecord(buffers: IAuditRecordBuffer[]): Promise<void> {
    const config = AUDIT_CONFIGURATION;

    if (!config.remote || config.port === 0) {
        return;
    }

    const remote: ISocketAddress = {
        address: config.remote,
        port: config.port,
    };

    const processedBuffer = await handlePlguin(buffers);

    switch (config.protocal) {
        case "tcp":
            return await audit4TCP(remote, config.family, processedBuffer);
        case "udp":
            return await audit4UDP(remote, config.family, processedBuffer);
        case "http":
        case "https":
        case "http2":
            return await audit4HTTP(remote, config.path, config.header, config.protocal, processedBuffer);
    }
}

async function handlePlguin(buffers: IAuditRecordBuffer[]): Promise<IAuditRecordBuffer[]> {
    let processedBuffer: IAuditRecordBuffer[] = buffers;
    for (const plugin of AUDIT_CONFIGURATION.plugin) {
        const processor = TIANYU.import(plugin.package || "", plugin.module || "")?.[plugin.method || ""];
        if (!processor) {
            break;
        }

        processedBuffer = await processor(processedBuffer);
    }

    return processedBuffer;
}

async function audit4UDP(remote: ISocketAddress, family: SocketAddressFamily, buffers: IAuditRecordBuffer[]): Promise<void> {
    for (const buffer of buffers) {
        const msg = `[${buffer.level}] --- ${buffer.timestamp} --- ${PROJECT_NAME} --- ${buffer.app} --- ${buffer.message}`;
        void TIANYU.import.MODULE.UdpClient(Buffer.from(msg), {
            remote,
            family,
            response: false,
            log: false,
        });
    }
}

async function audit4TCP(remote: ISocketAddress, family: SocketAddressFamily, buffers: IAuditRecordBuffer[]): Promise<void> {
    const client = new TIANYU.import.MODULE.TcpClient({ log: false });
    await client.connect({
        family: family === "IPv4" ? 4 : 6,
        port: remote.port,
        host: remote.address,
    });

    for (const buffer of buffers) {
        const addition = buffer.additionalData ? " --- " + JSON.stringify(buffer.additionalData) : "";
        const msg = `[${buffer.level}] --- ${buffer.timestamp} --- ${PROJECT_NAME} --- ${buffer.app} --- ${buffer.message}${addition}`;
        await client.send(Buffer.from(msg));
    }

    client.close();
}

async function audit4HTTP(
    remote: ISocketAddress,
    path: string,
    header: MapOfType<string | string[]>,
    protocal: HttpProtocal,
    buffers: IAuditRecordBuffer[],
): Promise<void> {
    const client = HTTP_CLIENT_MAP[protocal](remote.address, path, "POST");
    client.setPort(remote.port);
    client.setHeader(header);

    client.setBody(buffers);
    await client.send().catch(() => {
        // nothing to handled
    });
}
