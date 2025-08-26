/** @format */

// export type CommonOperationNotationOperations = "search" | "write" | "update" | "refresh" | "delete";

export interface ConditionMap {
    or: { a: number };
    and: {};
    in: {};
    between: {};
    less: {};
    lessEqual: {};
    great: {};
    greatEqual: {};
}

export interface ViewConnectionMap {
    join: {};
    "left-join": {};
    "right-join": {};
    "inner-join": {};
    "full-join": {};
    union: {};
}

export type Condition<OP extends keyof ConditionMap> = { op: OP; payload: ConditionMap[OP] };
export type ViewConnection<OP extends keyof ViewConnectionMap> = { op: OP; payload: ViewConnectionMap[OP] };

export interface CommonOperationNotationDefine {
    type: "search" | "write" | "update" | "refresh" | "delete";
    col: (string | { src: string; target?: string; func?: string })[] | "*";
    row: (string | { src: string; target?: string; func?: string })[] | "*";
    condition: Condition<any>;
    view: string | { schema: string; table: string } | ViewConnection<any>;
}

export type CommonOperationNotation = Record<string, CommonOperationNotationDefine>;
