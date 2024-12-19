/** @format */

import { SupportedDatabaseType } from "#interface";

export type InternalSqlTemplate = { [key in SupportedDatabaseType]?: string } & { default: string };
