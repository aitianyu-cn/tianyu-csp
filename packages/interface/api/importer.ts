/** @format */

/** CSP Import API for global, to import a object module from specified package */
export interface IImporter {
    /**
     * @param packageName package name which is the path of the object
     * @param objectName object name
     *
     * @example package name should follow the structure: {import_group}.{dir1}.{...}.{dirTarget}
     *          Import Group is assigned to two types: $ and #(or not provided).
     *
     *          for $ group, indicates the imported package is infra part, will import the object from inside.
     *          for # or not provided, indicate the imported package is customized, and will import the object based on the 'baseUrl'
     */
    (packageName: string, objectName: string): any;

    MODULE: typeof import("#module/module-export");
    html(file: string): string;
}

export type DataEncoding =
    | "ascii"
    | "utf8"
    | "utf-8"
    | "utf16le"
    | "utf-16le"
    | "ucs2"
    | "ucs-2"
    | "base64"
    | "base64url"
    | "latin1"
    | "binary"
    | "hex";
