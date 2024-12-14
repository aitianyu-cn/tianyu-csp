/** @format */

/** CSP feature config for each one feature */
export interface IFeaturesConfig {
    /** indicates the feature is default enabled if it is true */
    enable: boolean;
    /** description of the feature */
    description: string;
    /** contains the dependent feature names, indicates current feature can be enabled
     *  only when all the dependent features all enabled
     */
    dependency: string[];
}
