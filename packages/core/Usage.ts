/** @format */

import { IUsage } from "#infra/api/interface/Usage";
import { UsageImpl } from "#infra/api/impl/UsageImpl";

export const USAGE: IUsage = new UsageImpl();
