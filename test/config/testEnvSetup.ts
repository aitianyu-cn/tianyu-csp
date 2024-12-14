/** @format */

import { loadInfra } from "#core/InfraLoader";

beforeAll(() => {
    loadInfra();
});

afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
});
