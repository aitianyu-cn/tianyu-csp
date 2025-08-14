/** @format */

import * as qrcode from "qrcode";

export class QRCode {
    public static async getURL(text: string): Promise<string> {
        return new Promise<string>((resolve) => {
            qrcode.toDataURL(text, (error: Error | null | undefined, url: string) => {
                const textURL = error ? "" : url;
                resolve(textURL);
            });
        });
    }
}
