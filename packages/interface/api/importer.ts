/** @format */

/** CSP import package */
export interface ImportPackage {
    package?: string;
    module?: string;
    method?: string;
}

/** CSP Import API for global, to import a object module from specified package */
export interface IImporter {
    /**
     * @param packageName package name which is the path of the object
     * @param objectName object name
     *
     * @returns return imported object or null if the object not valid
     *
     * @example package name should follow the structure: {import_group}.{dir1}.{...}.{dirTarget}
     *          Import Group is assigned to two types: $ and #(or not provided).
     *
     *          for $ group, indicates the imported package is infra part, will import the object from inside.
     *          for # or not provided, indicate the imported package is customized, and will import the object based on the 'baseUrl'
     *
     * @throws throw error when get package failed
     */
    (packageName: string, objectName: string): any;

    /** CSP common modules */
    MODULE: typeof import("#module");
    /**
     * HTML file loader
     *
     * @param file html file
     * @returns return html file to string
     */
    html(file: string): string;
}

/** Data Encoding type */
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
