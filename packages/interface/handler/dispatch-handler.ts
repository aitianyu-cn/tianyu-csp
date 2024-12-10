/** @format */

export interface IDispatcherConsumer {}

export interface IDispatchHandler {
    bind(consumer: IDispatcherConsumer): void;
}

export interface DispatchHandlerOption {
    /** the maximum workers count */
    limitWorkers: number;
}
