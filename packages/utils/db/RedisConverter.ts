/** @format */

/**
 * @internal
 *
 * Converter of Redis
 */
export class RedisConverter {
    /**
     * To get a database index from giving database name.
     *
     * The database name of redis is a number value to indicate the database index. but we also
     * accept a customized name because we can convert it and to get the id from it.
     * 1. pure number: "10" => 10
     * 2. database name: "database2" => 2
     *
     * The database of redis only contains 16 databases, thus we can only accept number 0 to 15,
     * if the value is over 15 or less than 0, the 0 value will be assigned.
     *
     * @param database database id or name
     * @returns return a valid redis database index
     */
    public static getDatabase(database: string): number {
        const database2Index = Number(database.match(/[\-0-9]+/)?.[0]);
        return Number.isNaN(database2Index) ? 0 : database2Index > 15 || database2Index < 0 ? 0 : database2Index;
    }
}
