/** @format */

/** Interface for CSP feature */
export interface IFeature {
    /**
     * Check a feature is enabled or not
     *
     * @param featureName feature name
     * @returns return true if feature is enabled, otherwise false
     */
    isActive(featureName: string): Promise<boolean>;
}
