/** @format */

import { generateKeyPairSync, privateDecrypt, privateEncrypt, publicDecrypt, publicEncrypt, RSAKeyPairOptions } from "crypto";

export type RSAKeyFormatType = "pem" | "der";

export interface RSAKeyGenerationMap {
    pem: string;
    der: Buffer;
}

export type RSAKeyGenerationReturnType<K extends RSAKeyFormatType> = RSAKeyGenerationMap[K];

export interface RSAGenerationResult<priKey extends RSAKeyFormatType, pubKey extends RSAKeyFormatType> {
    privateKey: RSAKeyGenerationReturnType<priKey>;
    publicKey: RSAKeyGenerationReturnType<pubKey>;
}

export class RSA {
    public static new<priKey extends RSAKeyFormatType = "pem", pubKey extends RSAKeyFormatType = "pem">(
        options: RSAKeyPairOptions<priKey, pubKey>,
    ): RSAGenerationResult<priKey, pubKey> {
        const { publicKey, privateKey } = generateKeyPairSync("rsa", options);
        return {
            privateKey: privateKey as unknown as RSAKeyGenerationReturnType<priKey>,
            publicKey: publicKey as unknown as RSAKeyGenerationReturnType<pubKey>,
        };
    }

    public static encodepub(data: globalThis.DataView, publicKey: string | Buffer): Buffer {
        return publicEncrypt(publicKey, data);
    }

    public static encodepri(data: globalThis.DataView, privateKey: string | Buffer): Buffer {
        return privateEncrypt(privateKey, data);
    }

    public static decodepub(data: globalThis.DataView, privateKey: string | Buffer): Buffer {
        return publicDecrypt(privateKey, data);
    }

    public static decodepri(data: globalThis.DataView, publicKey: string | Buffer): Buffer {
        return privateDecrypt(publicKey, data);
    }
}
