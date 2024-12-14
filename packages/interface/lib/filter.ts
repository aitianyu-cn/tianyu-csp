/** @format */

/** A simple filter for CSP */
export interface IFilter {
    /** the field where the filter applied on */
    field: string;
    /** The selection of filter */
    selection: string[];
    /**
     * A flag indicates the selections are excluded or choosed.
     *
     * @example exclude: true & selection: [A, B, C] & all-members: [A, B, C, D, E]
     *          in this case, the valid members will be [D, E]
     */
    exclude?: boolean;
    /**
     * A flag indicates the result values should between two selections.
     * This flag is only work when selection has two memeber.
     *
     * @example
     * range:  true & selection: [1, 4] & all-members: [1, 5, 6, 7, 3, 2]
     * result: [2, 3]
     */
    range?: boolean;
}

/** Filter condition relation type */
export type FilterRelationType = "and" | "or" | "not";

/** A complex filter for CSP */
export interface IAdvancedFilter {
    /** Conditions relation type */
    relation: FilterRelationType;
    /**
     * Conditions list supports simple filter and inner advanced filter.
     * All the conditions in the list, will follow the relation current level defined
     *
     * @notes
     * and & or relation support a list of conditions, for not relation, only one filter
     * (include simple filter and advanced filter) is supported. If there is multi-conditions
     * in the list, only first condition will be picked.
     *
     * @example
     * type: and & condition: [A, B, C] => A and B and C
     * type: or  & condition: [A, B, C] => A or  B or  C
     * type: not & condition: [A] => not(A)
     *
     * type: and & condition: [[A and B], [C or D]] => (A and B) and (C or D)
     * type: not & condition: [[A and B or C]] => not (A and B or C)
     *
     */
    condition: (IFilter | IAdvancedFilter)[];
}
