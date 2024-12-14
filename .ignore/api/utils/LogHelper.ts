/** @format */

/** Log Helpers */
export class LogHelper {
    /**
     * Generate a structure log message by project, module and given message.
     *
     * @param project project type
     * @param moduleName module name inside of project
     * @param msg given log message
     * @returns return a formatted log message
     */
    public static generateMsg(project: string, moduleName: string, msg: string): string {
        throw new Error("Method not implemented.");
    }

    public static generateTime(time?: number | Date): string {
        const date = new Date(time || Date.now());
        const millisecondString = date.getMilliseconds().toString();
        const timeString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${millisecondString.substring(
            0,
            millisecondString.length > 3 ? 3 : millisecondString.length,
        )}`;
        return timeString;
    }
}
