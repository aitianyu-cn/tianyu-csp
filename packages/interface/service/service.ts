/** @format */

import { RequestType } from "../fwk-def/contributor/requests";

/** Interface for Common network Services */
export interface INetworkService {
    /** service id */
    id: string;
    /** network service request type */
    type: RequestType;

    /** To close current service */
    close(): void;
}
