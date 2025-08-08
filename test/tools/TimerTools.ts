/** @format */

export class TimerTools {
    public static async sleep(time: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, time);
        });
    }
}
