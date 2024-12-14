/** @format */

import { IDatabaseManager } from "./Database";
import { ISessionManagerBase } from "./Session";

export interface IRuntimeManager {
    session: ISessionManagerBase;
    db: IDatabaseManager;
}
