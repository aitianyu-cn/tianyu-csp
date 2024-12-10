/** @format */

export type ContributorFactor = (payload: any) => Promise<any>;

export interface IContributor {
    export(endpoint: string, id: string, factor: ContributorFactor): void;
    unexport(endpoint: string, id: string): void;
    find(ndpoint: string, id: string): ContributorFactor;
}

export interface ICSPFramework {
    contributor: IContributor;
}
