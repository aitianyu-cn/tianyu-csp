/** @format */

import {
  DATABASE_CONFIGS_MAP,
  DATABASE_TYPES_MAP,
  DATABASE_SYS_DB_MAP,
} from "../../dist/lib/Common.js";

import { DBProcessor } from "../../dist/lib/install.js";

async function testDBHandling() {
  /** @type {{ [database: string]: { type: SupportedDatabaseType; config: IDatabaseConnectionConfig } }} */
  const configs = {};
  for (const db of Object.keys(DATABASE_TYPES_MAP)) {
    if (DATABASE_CONFIGS_MAP[db]) {
      configs[db] = {
        type: DATABASE_TYPES_MAP[db],
        config: DATABASE_CONFIGS_MAP[db],
      };
    }
  }

  const install_data = DBProcessor.configProcessor(
    configs,
    Object.values(DATABASE_SYS_DB_MAP)
  );
  for (const type of Object.keys(install_data)) {
    const processor = DBProcessor.DatabaseProcessor[type];

    const cleanStatus = await processor?.cleaner(install_data[type]);
    if (!cleanStatus) {
      return Promise.reject();
    }

    const insertStatus = await processor.inserter(install_data[type]);
    if (!insertStatus) {
      return Promise.reject();
    }
  }
}

await testDBHandling();
