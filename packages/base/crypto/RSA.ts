/** @format */

import { generateKeyPairSync, privateDecrypt, privateEncrypt, publicDecrypt, publicEncrypt, RSAKeyPairOptions } from "crypto";

/**
 * RSA Key formatting type
 *
 * @field pem string formatting key
 * @field der buffer data key
 */
export type RSAKeyFormatType = "pem" | "der";

/** RSA key generation Map */
export interface RSAKeyGenerationMap {
    pem: string;
    der: Buffer;
}

/** RSA Key generation return type */
export type RSAKeyGenerationReturnType<K extends RSAKeyFormatType> = RSAKeyGenerationMap[K];

/** RSA Generation result */
export interface RSAGenerationResult<priKey extends RSAKeyFormatType, pubKey extends RSAKeyFormatType> {
    /** RSA private key */
    privateKey: RSAKeyGenerationReturnType<priKey>;
    /** RSA public key */
    publicKey: RSAKeyGenerationReturnType<pubKey>;
}

/** RSA Lib */
export class RSA {
    /**
     * To get a new RSA public key and private key
     *
     * @param options RSA key generation option
     * @returns return new RSA key
     */
    public static new<priKey extends RSAKeyFormatType = "pem", pubKey extends RSAKeyFormatType = "pem">(
        options: RSAKeyPairOptions<priKey, pubKey>,
    ): RSAGenerationResult<priKey, pubKey> {
        const { publicKey, privateKey } = generateKeyPairSync("rsa", options);
        return {
            privateKey: privateKey as unknown as RSAKeyGenerationReturnType<priKey>,
            publicKey: publicKey as unknown as RSAKeyGenerationReturnType<pubKey>,
        };
    }

    /**
     * To encode a value with public key, the encoded data can be decoded by private key
     *
     * @param data input data
     * @param publicKey encoding public key
     * @returns return encoded buffer
     */
    public static encodepub(data: globalThis.DataView, publicKey: string | Buffer): Buffer {
        return publicEncrypt(publicKey, data);
    }

    /**
     * To encode a value with private key, the encoded data can be decoded by public key
     *
     * @param data input data
     * @param publicKey encoding private key
     * @returns return encoded buffer
     */
    public static encodepri(data: globalThis.DataView, privateKey: string | Buffer): Buffer {
        return privateEncrypt(privateKey, data);
    }

    /**
     * To decode a value with public key, the value is encoded by private key
     *
     * @param data input data
     * @param publicKey decoding public key
     * @returns return decoded buffer
     */
    public static decodepub(data: globalThis.DataView, publicKey: string | Buffer): Buffer {
        return publicDecrypt(publicKey, data);
    }

    /**
     * To decode a value with private key, the value is encoded by public key
     *
     * @param data input data
     * @param privateKey decoding private key
     * @returns return decoded buffer
     */
    public static decodepri(data: globalThis.DataView, privateKey: string | Buffer): Buffer {
        return privateDecrypt(privateKey, data);
    }
}
