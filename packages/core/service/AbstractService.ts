/** @format */

import { INetworkService } from "#interface";

export abstract class AbstractService<TYPE> implements INetworkService<TYPE> {
    public abstract get id(): string;
    public abstract get type(): TYPE;

    public abstract close(callback?: (err?: Error) => void): void;

    public get app(): string {
        return `service/${this.type}/${this.id}`;
    }
}
