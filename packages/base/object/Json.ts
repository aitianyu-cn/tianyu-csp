/** @format */

/** Json Lib */
export class Json {
    /**
     * @deprecated
     *
     * convert a string to be a javascript object.
     * This is an unsafe function to convert a string to be object. suggest to use parseSafe to convert string to object.
     *
     * @param src source string
     * @returns target js-object
     */
    public static parse(src: string): any {
        return JSON.parse(src);
    }

    /**
     * convert a string to be a javascript object safty
     *
     * @param src source string
     * @param failed value returned when converted failed, default is null
     * @returns target js-object
     */
    public static parseSafe(src: string, failed: any = null): any | null {
        try {
            return JSON.parse(src);
        } catch (e) {
            void TIANYU.audit.error(
                "base/object/Json",
                `could not safety parse string (${src.substring(0, src.length > 20 ? 20 : src.length)}...) to be an object.`,
                String(e),
            );
            return failed;
        }
    }
}
