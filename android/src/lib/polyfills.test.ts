// src/lib/polyfills.test.ts
/**
 * Regression test: the polyfill must not call back into globalThis.crypto, which
 * expo-crypto does on web and which caused "Maximum call stack size exceeded".
 */
jest.mock("expo-crypto", () => ({
  getRandomBytes: (count: number) => new Uint8Array(count).map((_, index) => (index * 37 + 11) % 256),
  randomUUID: () => {
    // Mirrors the web implementation, which delegates to globalThis.crypto.
    return (globalThis as unknown as { crypto: { randomUUID: () => string } }).crypto.randomUUID();
  },
}));

describe("crypto polyfill", () => {
  const originalCrypto = (globalThis as { crypto?: unknown }).crypto;

  afterEach(() => {
    (globalThis as { crypto?: unknown }).crypto = originalCrypto;
  });

  it("provides a v4 UUID without recursing", () => {
    (globalThis as { crypto?: unknown }).crypto = undefined;
    jest.isolateModules(() => {
      require("./polyfills");
    });
    const uuid = (globalThis as unknown as { crypto: { randomUUID: () => string } }).crypto.randomUUID();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("fills typed arrays through getRandomValues", () => {
    (globalThis as { crypto?: unknown }).crypto = {};
    jest.isolateModules(() => {
      require("./polyfills");
    });
    const array = new Uint32Array(4);
    const result = (globalThis as unknown as { crypto: { getRandomValues: (a: Uint32Array) => Uint32Array } }).crypto.getRandomValues(array);
    expect(result).toBe(array);
    expect(array.some((value) => value !== 0)).toBe(true);
  });
});
