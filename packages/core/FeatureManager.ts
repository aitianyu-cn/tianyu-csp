/** @format */

import { FeatureManagerImpl } from "#infra/api/impl/FeatureManagerImpl";
import { IFeatureManager } from "#infra/index";

export const FEATURE_MGR: IFeatureManager = new FeatureManagerImpl();
