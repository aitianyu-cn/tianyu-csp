/** @format */

import { TraceImpl } from "#infra/api/impl/TraceImpl";
import { ITrace } from "#infra/index";

export { clearTrace, selectTraceCount, selectTraceRecords } from "#infra/api/db/TraceAccessor";

export const TRACE: ITrace = new TraceImpl();
