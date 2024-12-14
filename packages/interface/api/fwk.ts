/** @format */

import { MapOfType } from "@aitianyu.cn/types";
import { ContributorProtocolWithReturn } from "../fwk-def/contributor/basic";
import { IContributorFactorProtocolMap } from "../fwk-def/contributor-protocol";

export type ContributorFactor<DATA, RETURN> = (payload: DATA) => RETURN;

export type ContributorFactorKey = keyof IContributorFactorProtocolMap;

export type ContributorFactorPayloadType<K extends ContributorFactorKey> = K extends keyof IContributorFactorProtocolMap
    ? IContributorFactorProtocolMap[K] extends ContributorProtocolWithReturn<infer Data, any>
        ? Data
        : IContributorFactorProtocolMap[K]
    : undefined;

export type ContributorFactorReturnType<K extends ContributorFactorKey> = K extends keyof IContributorFactorProtocolMap
    ? IContributorFactorProtocolMap[K] extends ContributorProtocolWithReturn<any, infer Return>
        ? Return
        : IContributorFactorProtocolMap[K]
    : void;

export interface IContributor {
    registerEndpoint(endpoint: ContributorFactorKey): void;
    unregisterEndpoint(endpoint: ContributorFactorKey): void;
    hasEndpoint(endpoint: ContributorFactorKey): boolean;

    exportModule<ENDPOINT extends ContributorFactorKey>(
        endpoint: ENDPOINT,
        id: string,
        factor: ContributorFactor<ContributorFactorPayloadType<ENDPOINT>, ContributorFactorReturnType<ENDPOINT>>,
    ): void;

    unexportModule<ENDPOINT extends ContributorFactorKey>(endpoint: ENDPOINT, id: string): void;

    findModule<ENDPOINT extends ContributorFactorKey>(
        endpoint: ENDPOINT,
        id: string,
    ): ContributorFactor<ContributorFactorPayloadType<ENDPOINT>, ContributorFactorReturnType<ENDPOINT>> | undefined;

    allModules<ENDPOINT extends ContributorFactorKey>(
        endpoint: ENDPOINT,
    ): MapOfType<ContributorFactor<ContributorFactorPayloadType<ENDPOINT>, ContributorFactorReturnType<ENDPOINT>>>;
}

export interface ICSPFramework {
    contributor: IContributor;
}
