/** @format */

export class TimerTools {
    public static sleep(time: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, time);
        });
    }
}
