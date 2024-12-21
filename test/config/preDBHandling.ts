/** @format */

import { IDatabaseConnectionConfig, SupportedDatabaseType } from "#interface";
import { DBProcessor } from "packages/install";

export async function testDBHandling(): Promise<void> {
    // const configs: { [database: string]: { type: SupportedDatabaseType; config: IDatabaseConnectionConfig } } = {};
    // for (const db of Object.keys(DATABASE_TYPES_MAP)) {
    //     if (DATABASE_CONFIGS_MAP[db]) {
    //         configs[db] = { type: DATABASE_TYPES_MAP[db], config: DATABASE_CONFIGS_MAP[db] };
    //     }
    // }
    // const install_data = DBProcessor.configProcessor(configs, Object.values(DATABASE_SYS_DB_MAP));
    // for (const type of Object.keys(install_data)) {
    //     const processor = DBProcessor.DatabaseProcessor[type as SupportedDatabaseType];
    //     const cleanStatus = await processor?.cleaner(install_data[type]);
    //     if (!cleanStatus) {
    //         return Promise.reject();
    //     }
    //     const insertStatus = await processor.inserter(install_data[type]);
    //     if (!insertStatus) {
    //         return Promise.reject();
    //     }
    // }
}
