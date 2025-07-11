/** @format */

import { IOFilePath } from "#interface";

export const FILE_HELPER_DEFAULT_OPEN_FILE: IOFilePath = {
    type: "internal",
    path: "test/content/file/open_test",
};

export const FILE_HELPER_DEFAULT_OPEN_FILE_UNEXIST: IOFilePath = {
    type: "internal",
    path: "test/content/file/open_test_unexist",
};

export const FILE_HELPER_DEFAULT_READ_FILE: IOFilePath = {
    type: "internal",
    path: "test/content/file/read.a",
};

export const FILE_HELPER_DEFAULT_WRITE_FILE: IOFilePath = {
    type: "internal",
    path: "test/content/file/write.a",
};

export const FILE_HELPER_DEFAULT_CREATE_DIR: IOFilePath = {
    type: "internal",
    path: "test/content/file/new-dir",
};

export const FILE_HELPER_DEFAULT_CREATE_DIR_FAILED: IOFilePath = {
    type: "external",
    path: "0:/test/content/file/new-dir",
};

export const FILE_HELPER_DEFAULT_REMOVE_FILE_FAILED: IOFilePath = {
    type: "external",
    path: "0:/test/content/file/file",
};

export const FILE_HELPER_DEFAULT_REMOVE_DIR_FAILED: IOFilePath = {
    type: "external",
    path: "0:/test/content/file/remove-dir",
};
