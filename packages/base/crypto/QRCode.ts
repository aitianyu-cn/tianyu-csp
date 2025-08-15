/** @format */

import * as qrcode from "qrcode";

/** QR code Lib */
export class QRCode {
    /**
     * Async getting a base64 URL of given text
     *
     * @param text source text
     * @returns return base64 URL string
     */
    public static async getURL(text: string): Promise<string> {
        return new Promise<string>((resolve) => {
            qrcode.toDataURL(text, (error: Error | null | undefined, url: string) => {
                const textURL = error ? "" : url;
                resolve(textURL);
            });
        });
    }
}
