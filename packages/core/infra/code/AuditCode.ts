/** @format */

import { HttpProtocal, ISocketAddress, SocketAddressFamily, SocketProtocal } from "#interface";
import { MapOfType } from "@aitianyu.cn/types";
import { AUDIT_CONFIGURATION, PROJECT_NAME } from "packages/Common";
import { HTTP_CLIENT_MAP } from "packages/modules/Constant";
import { PluginHandler } from "packages/utils/handler/PluginHandler";

export interface IAuditRecordBuffer {
    timestamp: string;
    app: string;
    message: string;
    level: string;
    additionalData: any;
}

export async function handleAuditRecord(buffers: IAuditRecordBuffer[]): Promise<void> {
    const config = AUDIT_CONFIGURATION;

    /* istanbul ignore if */
    if (!config.remote || /* istanbul ignore next */ config.port === 0) {
        return;
    }

    /* istanbul ignore next */
    const remote: ISocketAddress = {
        address: config.remote,
        port: config.port,
    };

    /* istanbul ignore next */
    const processedBuffer = await PluginHandler.handlePlguin(buffers, config.plugin);

    /* istanbul ignore next */
    switch (config.protocal) {
        case "tcp":
            return await audit4TCP(remote, config.family, processedBuffer);
        case "udp" /* istanbul ignore next */:
            return await audit4UDP(remote, config.family, processedBuffer);
        case "http": /* istanbul ignore next */
        case "https": /* istanbul ignore next */
        case "http2" /* istanbul ignore next */:
            return await audit4HTTP(remote, config.path, config.header, config.protocal, processedBuffer);
    }
}

export async function audit4UDP(
    remote: ISocketAddress,
    family: SocketAddressFamily,
    buffers: IAuditRecordBuffer[],
): Promise<void> {
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

export async function audit4TCP(
    remote: ISocketAddress,
    family: SocketAddressFamily,
    buffers: IAuditRecordBuffer[],
): Promise<void> {
    const client = new TIANYU.import.MODULE.TcpClient({ log: false });
    await client.connect({
        family: family === "IPv4" ? 4 : /* istanbul ignore next */ 6,
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

export async function audit4HTTP(
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
    await client.send().catch(
        /* istanbul ignore next */ () => {
            // nothing to handled
        },
    );
}
