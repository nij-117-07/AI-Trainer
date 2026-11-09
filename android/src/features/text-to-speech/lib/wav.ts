// src/features/text-to-speech/lib/wav.ts
/** Raw PCM from some speech models has no header, so players cannot open it. This adds a WAV header. */

const DEFAULT_SAMPLE_RATE = 24000;

export function isPcmMime(mimeType: string): boolean {
  const lower = mimeType.toLowerCase();
  return lower.includes("pcm") || lower.includes("l16");
}

export function sampleRateFromMime(mimeType: string): number {
  const match = /rate=(\d+)/i.exec(mimeType);
  const rate = match ? Number(match[1]) : NaN;
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_SAMPLE_RATE;
}

export function pcmToWav(pcm: ArrayBuffer, sampleRate = DEFAULT_SAMPLE_RATE, channels = 1): ArrayBuffer {
  const bitsPerSample = 16;
  const blockAlign = (channels * bitsPerSample) / 8;
  const dataLength = pcm.byteLength;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataLength, true);
  new Uint8Array(buffer, 44).set(new Uint8Array(pcm));
  return buffer;
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}
