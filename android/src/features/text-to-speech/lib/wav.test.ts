// src/features/text-to-speech/lib/wav.test.ts
import { isPcmMime, pcmToWav, sampleRateFromMime } from "./wav";

describe("pcmToWav", () => {
  it("writes a 44-byte RIFF header in front of the samples", () => {
    const pcm = new Uint8Array([1, 2, 3, 4]).buffer;
    const wav = new DataView(pcmToWav(pcm, 24000, 1));
    const text = (offset: number, length: number) =>
      String.fromCharCode(...Array.from({ length }, (_, index) => wav.getUint8(offset + index)));

    expect(wav.byteLength).toBe(48);
    expect(text(0, 4)).toBe("RIFF");
    expect(text(8, 4)).toBe("WAVE");
    expect(wav.getUint16(20, true)).toBe(1);
    expect(wav.getUint16(22, true)).toBe(1);
    expect(wav.getUint32(24, true)).toBe(24000);
    expect(wav.getUint16(34, true)).toBe(16);
    expect(text(36, 4)).toBe("data");
    expect(wav.getUint32(40, true)).toBe(4);
    expect(wav.getUint8(44)).toBe(1);
  });
});

describe("pcm detection", () => {
  it("recognises PCM MIME types and reads the sample rate", () => {
    expect(isPcmMime("audio/L16;rate=24000")).toBe(true);
    expect(isPcmMime("audio/pcm")).toBe(true);
    expect(isPcmMime("audio/mpeg")).toBe(false);
    expect(sampleRateFromMime("audio/L16;rate=16000")).toBe(16000);
    expect(sampleRateFromMime("audio/pcm")).toBe(24000);
  });
});
