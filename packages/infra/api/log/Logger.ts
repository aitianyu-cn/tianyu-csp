/** @format */

import { ILogger } from "./ILogger";
import { LoggerImpl } from "./LoggerImpl";

export const LOGGER: ILogger = new LoggerImpl();
