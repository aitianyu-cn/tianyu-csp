/** @format */

import { LoggerImpl } from "#infra/api/impl/LoggerImpl";
import { ILogger } from "#infra/index";

export const LOGGER: ILogger = new LoggerImpl();
