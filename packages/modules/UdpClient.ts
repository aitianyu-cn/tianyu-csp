/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { UdpClientOptions, UdpClientResponse } from "#interface";
import { ErrorHelper } from "#utils";
import { LogLevel } from "@aitianyu.cn/types";
import dgram from "dgram";

/**
 * To create a UDP client instance to send given data to specified remote server
 *
 * @param data data to transfer
 * @param { remote: ISocketAddress, family?: SocketAddressFamily, response?: boolean, log?: boolean }
 *             configuration of UDP client
 *              - remote: the remote server address
 *              - family: the IP address family, if IPv6 address is given in "remote" field, this field should MUST be set to IPv6
 *              - response: check whether should waiting for server response
 *              - log: indicates the error should be printed in TIANYU.logger service or not
 * @returns return received UDP response data. undefined will be returned if no data received from server
 */
export async function UdpClient(
    data: Buffer,
    { remote, family, response, log }: UdpClientOptions,
): Promise<UdpClientResponse | void> {
    const client = dgram.createSocket(family === "IPv6" ? "udp6" : "udp4");

    return new Promise<UdpClientResponse | void>((resolve, reject) => {
        client.send(data, remote.port, remote.address, (error) => {
            if (error) {
                client.close();

                const err_msg = `request to remote[${remote.address}:${remote.port}] failed - source data[${data.toString(
                    "utf-8",
                )}] - ${error.message}`;
                log &&
                    TIANYU.audit.warn(
                        "client/udp",
                        ErrorHelper.getErrorString(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR, err_msg, error.stack),
                    );

                reject(ErrorHelper.getError(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR, err_msg, error.stack));
            } else {
                if (!response) {
                    client.close();
                    resolve();
                }
            }
        });

        client.on("message", (msg: Buffer, rinfo: dgram.RemoteInfo) => {
            client.close();
            resolve({
                data: msg,
                remote: {
                    address: rinfo.address,
                    port: rinfo.port,
                },
            });
        });

        client.on(
            "error",
            /* istanbul ignore next */ (error: Error) => {
                client.close();

                const err_msg = `UDP client to remote[${remote.address}:${remote.port}] failed - source data[${data.toString(
                    "utf-8",
                )}] - ${error.message}`;
                log &&
                    TIANYU.audit.warn(
                        "client/udp",
                        ErrorHelper.getErrorString(SERVICE_ERROR_CODES.INTERNAL_ERROR, err_msg, error.stack),
                    );

                reject(ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, err_msg, error.stack));
            },
        );
    });
}
