/** @format */

export class Json {
    public static parse(src: string): any {
        return JSON.parse(src);
    }

    public static parseSafe(src: string): any | null {
        try {
            return JSON.parse(src);
        } catch (e) {
            void TIANYU.audit.error(
                "base/object/Json",
                `could not safety parse string (${src.substring(0, src.length > 20 ? 20 : src.length)}...) to be an object.`,
                String(e),
            );
            return null;
        }
    }
}
