/** @format */

import { SERVICE_ERROR_CODES } from "#core/Constant";
import { Http2Query, HTTP_STATUS_CODE, HttpCallMethod, NetworkServiceResponseData } from "#interface";
import { ErrorHelper, HttpHelper } from "#utils";
import { HTTP_CLIENT_MAP } from "packages/modules/net/Constant";
import { Http2Client } from "packages/modules/net/Http2Client";
import { LOADER_IGNORE_PATTERN, REST_CONFIG } from "packages/Common";
import { StringHelper } from "@aitianyu.cn/types";

/**
 * @internal
 *
 * To execute a remote proxy.
 *
 * @returns return a network service valid response data from remote proxy returns
 */
export async function loader(): Promise<NetworkServiceResponseData> {
    if (LOADER_IGNORE_PATTERN.test(TIANYU.request.url)) {
        return REST_CONFIG?.errorpage?.[403]
            ? {
                  statusCode: HTTP_STATUS_CODE.TEMPORARY_REDIRECT,
                  headers: {
                      Location: StringHelper.format(REST_CONFIG?.errorpage?.[403], [
                          TIANYU.request.url,
                          HttpHelper.stringifyParam(TIANYU.request.allParams()),
                      ]),
                  },
                  body: null,
              }
            : /* istanbul ignore next */ {
                  statusCode: HTTP_STATUS_CODE.FORBIDDEN,
                  headers: {},
                  body: null,
              };
    }

    const protocol = TIANYU.request.protocol;
    const relocatHost = TIANYU.request.host;
    const url = TIANYU.request.url;

    if (!TIANYU.environment.development && protocol === "http") {
        return {
            statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
            headers: {},
            body: ErrorHelper.getError(
                SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR,
                `proxy to http://${relocatHost}${url} failed`,
                "Due to security requirement, 'HTTP/1.1 no SSL/TSL' protocol is not supported in production application anymore, please provide a security host.",
            ),
        };
    }

    const header = TIANYU.request.allHeaders();
    const params = TIANYU.request.allParams();
    const body = TIANYU.request.body;
    const method: HttpCallMethod = body ? "POST" : "GET";

    const { host, port } = HttpHelper.parseHost(relocatHost);
    const client = HTTP_CLIENT_MAP[protocol](host, url, method);
    client.setHeader(header);
    client.setParameter(params);
    port && client.setPort(port);

    if (protocol === "http2") {
        handleHttp2(client as Http2Client, body);
    } else {
        client.setBody(body);
    }

    let status = HTTP_STATUS_CODE.OK;
    await client.send().catch((error) => {
        if (typeof error === "number") {
            status = error;
        }

        const msg = `request to proxy to ${protocol === "http" ? "http" : "https"}://${relocatHost}${url} failed`;
        void TIANYU.audit.warn(
            "service/proxy",
            msg,
            ErrorHelper.getError(SERVICE_ERROR_CODES.SERVICE_REQUEST_ERROR, msg, String(error)),
        );
    });

    if (protocol === "http2") {
        return getResponseFromHttp2(client as Http2Client);
    }

    return {
        statusCode: status,
        headers: client.allHeaders(),
        body: client.raw,
    };
}

function handleHttp2(client: Http2Client, body: any): void {
    const querys: Http2Query[] = Array.isArray(body?.queries) ? body.queries : [];
    if (querys.length) {
        for (const query of querys) {
            client.query(query);
        }
    } else {
        client.setBody(body);
    }
}

function getResponseFromHttp2(client: Http2Client): NetworkServiceResponseData {
    if (client.count === 1) {
        return {
            statusCode: client.status,
            headers: client.getHeader(0),
            body: client.raw,
        };
    }

    const queryResponses: NetworkServiceResponseData[] = [];
    for (let index = 0; index < client.count; ++index) {
        queryResponses.push({
            statusCode: client.getStatus(index),
            headers: client.getHeader(index),
            body: client.getRaw(index),
        });
    }

    return {
        statusCode: HTTP_STATUS_CODE.OK,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(queryResponses),
    };
}
