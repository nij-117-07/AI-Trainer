// src/lib/polyfills.ts
/**
 * Hermes does not provide the Web Crypto `randomUUID` method that @ax-llm/ax uses.
 * Fill it in from expo-crypto's random bytes. Do not call expo-crypto's randomUUID or
 * getRandomValues here: on web they delegate to globalThis.crypto, which would call this
 * polyfill again and recurse forever.
 */
import * as Crypto from "expo-crypto";

const MAX_RANDOM_BYTES = 1024;

interface CryptoPolyfillTarget {
  crypto?: {
    randomUUID?: () => string;
    getRandomValues?: <T extends ArrayBufferView>(array: T) => T;
  };
}

function fillRandomBytes(target: Uint8Array): void {
  for (let offset = 0; offset < target.length; offset += MAX_RANDOM_BYTES) {
    const chunk = Crypto.getRandomBytes(Math.min(MAX_RANDOM_BYTES, target.length - offset));
    target.set(chunk, offset);
  }
}

function randomUUID(): string {
  const bytes = new Uint8Array(16);
  fillRandomBytes(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const target = globalThis as unknown as CryptoPolyfillTarget;

if (!target.crypto) {
  target.crypto = {};
}

if (typeof target.crypto.randomUUID !== "function") {
  target.crypto.randomUUID = randomUUID;
}

if (typeof target.crypto.getRandomValues !== "function") {
  target.crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
    fillRandomBytes(new Uint8Array(array.buffer, array.byteOffset, array.byteLength));
    return array;
  };
}
