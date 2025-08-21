/** @format */

import { MessageBundle } from "#base/res/InternalMessageBundle";
import { SERVICE_ERROR_CODES } from "#core/Constant";
import { ProcedureCallPayload } from "#interface";
import { ErrorHelper, HttpHelper } from "#utils";
import { HTTP_CLIENT_MAP } from "./Constant";

/**
 * To connect to remote system and get the return from remote
 *
 * @param payload remote connection payload
 * @param transformer response data transformer function
 * @returns return the formatted remote response
 */
export async function call<T = string>(
    payload: ProcedureCallPayload,
    transformer: (input: string) => T | null,
): Promise<T | null> {
    if (!TIANYU.environment.development && payload.protocol === "http") {
        return Promise.reject(
            ErrorHelper.getError(
                SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR,
                MessageBundle.text("ERROR_MODULES_NET_RPC_PROTOCOL_INVALID", payload.host, payload.url),
                MessageBundle.text("ERROR_MODULES_NET_RPC_PROTOCOL_INVALID_DET"),
            ),
        );
    }

    const { host, port } = HttpHelper.parseHost(payload.host);
    const client = HTTP_CLIENT_MAP[payload.protocol](host, payload.url, payload.method);
    payload.header && client.setHeader(payload.header);
    payload.param && client.setParameter(payload.param);
    payload.cookies && client.setCookie(payload.cookies);
    payload.body && client.setBody(payload.body);
    port && client.setPort(port);

    return client.send().then(
        async () => {
            try {
                return transformer(client.raw);
            } catch (e) {
                const msg = MessageBundle.text("ERROR_MODULES_NET_RPC_RESPONSE_CONVERTION_FAILED");
                void TIANYU.audit.warn(
                    "service/rpc",
                    msg,
                    ErrorHelper.getError(SERVICE_ERROR_CODES.INTERNAL_ERROR, msg, String(e)),
                );

                return null;
            }
        },
        async (error) => {
            const msg = MessageBundle.text(
                "ERROR_MODULES_NET_RPC_REQUEST_FAILED",
                payload.protocol === "http" ? "http" : "https",
                payload.host,
                payload.url,
            );
            const rejectError = ErrorHelper.getError(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR, msg, String(error));
            void TIANYU.audit.warn("service/rpc", msg, rejectError);

            return Promise.reject(rejectError);
        },
    );
}
