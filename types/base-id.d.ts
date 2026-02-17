declare module "base-id" {
  type BytesOptions = {
    array?: boolean;
  };

  interface BaseIdCodec {
    encode(value: unknown): string;
    decode(encodedString: string): string;
    encodeWithPrefix(value: unknown, prefix: string): string;
    decodeWithPrefix(encodedString: string, prefix: string): string;
    generateToken(bytes: number, prefix?: string): string;
    generateBytes(count: number, options?: BytesOptions): number[] | Uint8Array;
    bytesToHex(bytes: ArrayLike<number>): string;
    decodeHexToNumeric(hex: string): bigint;
    encodeNumericToHex(value: number | bigint): string;
    getHexFromObject(value: unknown): string;
    getUUIDFromHex(hex: string, lowercase?: boolean): string;
  }

  export const base58: BaseIdCodec;
  export const base62: BaseIdCodec;
  export const base62p: BaseIdCodec;
}
