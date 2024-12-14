/** @format */

import {
    ContributorFactor,
    ContributorFactorKey,
    ContributorFactorPayloadType,
    ContributorFactorReturnType,
    IContributor,
} from "#interface";
import { MapOfType } from "@aitianyu.cn/types";

export class ContributorManager implements IContributor {
    private _map: Map<string, Map<string, ContributorFactor<any, any>>>;

    public constructor() {
        this._map = new Map<string, Map<string, ContributorFactor<any, any>>>();
    }

    public registerEndpoint(endpoint: ContributorFactorKey): void {
        if (!this._map.has(endpoint)) {
            this._map.set(endpoint, new Map<string, ContributorFactor<any, any>>());
        }
    }
    public unregisterEndpoint(endpoint: ContributorFactorKey): void {
        this._map.delete(endpoint);
    }
    public hasEndpoint(endpoint: ContributorFactorKey): boolean {
        return this._map.has(endpoint);
    }

    public exportModule<ENDPOINT extends ContributorFactorKey>(
        endpoint: ENDPOINT,
        id: string,
        factor: ContributorFactor<ContributorFactorPayloadType<ENDPOINT>, ContributorFactorReturnType<ENDPOINT>>,
    ): void {
        this.registerEndpoint(endpoint);
        this._map.get(endpoint)?.set(id, factor);
    }
    public unexportModule<ENDPOINT extends ContributorFactorKey>(endpoint: ENDPOINT, id: string): void {
        this._map.get(endpoint)?.delete(id);
    }
    public findModule<ENDPOINT extends ContributorFactorKey>(
        endpoint: ENDPOINT,
        id: string,
    ): ContributorFactor<ContributorFactorPayloadType<ENDPOINT>, ContributorFactorReturnType<ENDPOINT>> | undefined {
        return this._map.get(endpoint)?.get(id);
    }
    public allModules<ENDPOINT extends ContributorFactorKey>(
        endpoint: ENDPOINT,
    ): MapOfType<ContributorFactor<ContributorFactorPayloadType<ENDPOINT>, ContributorFactorReturnType<ENDPOINT>>> {
        const map: MapOfType<ContributorFactor<ContributorFactorPayloadType<ENDPOINT>, ContributorFactorReturnType<ENDPOINT>>> =
            {};

        this._map.get(endpoint)?.forEach((factor, key) => {
            map[key] = factor;
        });

        return map;
    }
}
