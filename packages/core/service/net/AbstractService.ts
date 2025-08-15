/** @format */

import { INetworkService } from "#interface";
import { IReleasable } from "packages/interface/api/lifecycle";

export abstract class AbstractService<TYPE> implements INetworkService<TYPE>, IReleasable {
    public abstract get id(): string;
    public abstract get type(): TYPE;

    public abstract close(callback?: (err?: Error) => void): Promise<void>;

    public get app(): string {
        return `service/${this.type}/${this.id}`;
    }
}
