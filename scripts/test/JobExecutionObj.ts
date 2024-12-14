/** @format */

import { SchedultJobExecuteParam } from "#interface";

export function success(data: SchedultJobExecuteParam): any {
    return { status: "success" };
}

export function failed(): void {
    throw new Error("error");
}

export function failedNoMessage(): void {
    throw new Error();
}
