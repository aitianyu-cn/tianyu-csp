/** @format */

/** Interface for an object can be released by Tianyu-CSP lifecycle */
export interface IReleasable {
    /** instance id */
    id: string;
    /** To close current instace and release all resources */
    close(): void | Promise<void>;
}

/** CSP Lifecycle API for global */
export interface ILifecycle {
    /**
     * To add a new instance with specified id to move the instance lifecycle management to CSP
     *
     * @param obj instance
     */
    join(obj: IReleasable): void;
    /**
     * To remove an instance to turn back the instance lifecycle management
     *
     * @param id removed instance id
     */
    leave(id: string): IReleasable | null;
    /** To recycle all managed instance and release all resouces */
    recycle(): Promise<void>;
}
