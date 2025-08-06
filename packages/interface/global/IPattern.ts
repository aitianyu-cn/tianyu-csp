/** @format */

/** Interface of Pattern */
export interface IPattern {
    /**
     * To test the given string does match the pattern list
     *
     * @param str given string
     * @returns return true if the pattern matched, otherwise false
     */
    test(str: string): boolean;
}
