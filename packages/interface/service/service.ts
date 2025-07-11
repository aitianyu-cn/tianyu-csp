/** @format */

/** Interface for Common network Services */
export interface INetworkService {
    /** service id */
    id: string;

    /** To close current service */
    close(callback?: (err?: Error) => void): void;
}
