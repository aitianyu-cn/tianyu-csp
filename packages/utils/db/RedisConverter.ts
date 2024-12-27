/** @format */

export class RedisConverter {
    public static getDatabase(database: string): number {
        const database2Index = Number(database.match(/[\-0-9]+/)?.[0]);
        return Number.isNaN(database2Index) ? 0 : database2Index > 15 || database2Index < 0 ? 0 : database2Index;
    }
}
