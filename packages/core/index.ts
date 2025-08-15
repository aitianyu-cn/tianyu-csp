/** @format */

import { createContributor } from "./InfraLoader";

export * from "./handler/DispatchHandler";
export * from "./handler/RequestHandler";

export * as Basic from "#base/index";
export * as Net from "./service/net";
export * as IO from "./service/io";

export { loadInfra as load } from "./InfraLoader";

/** default creator for CSP */
export const creator = {
    /** to create a default contributor */
    contributor: createContributor,
};
