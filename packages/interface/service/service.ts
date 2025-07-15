/** @format */

/** Interface for Common network Services */
export interface INetworkService<TYPE> {
    /** service id */
    id: string;
    /** service type */
    type: TYPE;

    /** To close current service */
    close(callback?: (err?: Error) => void): void;
}
