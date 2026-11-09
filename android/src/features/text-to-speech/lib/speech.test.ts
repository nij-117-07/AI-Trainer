// src/features/text-to-speech/lib/speech.test.ts
import { resolveSpeechConnection, isSpeechConfigured } from "@/features/ai-settings/lib/speech";
import type { AiSettings } from "@/features/ai-settings/types";
import { extensionForMime } from "./mime";
import { HISTORY_LIMIT, addEntry, makeEntry, normalizeHistory, type SpeechEntry } from "./history";
import { buildSpeechBody, MAX_SPEECH_CHARS, speechEndpoint, synthesizeSpeech } from "./synthesize";

const chat: AiSettings = {
  modelName: "chat-model",
  apiKey: "chat-key",
  baseUrl: "https://openrouter.ai/api/v1/",
  transcriptionModel: "",
  transcriptionBaseUrl: "",
  transcriptionApiKey: "",
  ttsModel: "google/gemini-3.8-flash-lite-tts",
  ttsVoice: "Zephyr",
  ttsBaseUrl: "",
  ttsApiKey: "",
};

describe("resolveSpeechConnection", () => {
  it("falls back to the chat base URL and key", () => {
    expect(resolveSpeechConnection(chat)).toEqual({
      baseUrl: "https://openrouter.ai/api/v1/",
      apiKey: "chat-key",
      model: "google/gemini-3.8-flash-lite-tts",
      voice: "Zephyr",
    });
  });

  it("uses its own base URL and key when set", () => {
    const resolved = resolveSpeechConnection({ ...chat, ttsBaseUrl: " https://tts.example.com/v1 ", ttsApiKey: "tts-key" });
    expect(resolved.baseUrl).toBe("https://tts.example.com/v1");
    expect(resolved.apiKey).toBe("tts-key");
  });

  it("requires a model and voice as well as the connection", () => {
    expect(isSpeechConfigured(resolveSpeechConnection(chat))).toBe(true);
    expect(isSpeechConfigured(resolveSpeechConnection({ ...chat, ttsVoice: "" }))).toBe(false);
    expect(isSpeechConfigured(resolveSpeechConnection({ ...chat, ttsModel: "" }))).toBe(false);
  });
});

describe("speech request", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("builds the endpoint and the model, input, and voice body", () => {
    expect(speechEndpoint("https://openrouter.ai/api/v1/")).toBe("https://openrouter.ai/api/v1/audio/speech");
    expect(JSON.parse(buildSpeechBody(" m ", "Hi", " Zephyr "))).toEqual({ model: "m", input: "Hi", voice: "Zephyr" });
  });

  const connection = { baseUrl: "https://openrouter.ai/api/v1", apiKey: "k", model: "m", voice: "Zephyr" };

  it("returns the audio bytes and the generation id", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    global.fetch = jest.fn().mockResolvedValue(
      new Response(bytes, { status: 200, headers: { "Content-Type": "audio/mpeg", "X-Generation-Id": "gen-1" } })
    ) as unknown as typeof fetch;

    const clip = await synthesizeSpeech({ connection, text: "Hello" });

    expect(clip.bytes.byteLength).toBe(3);
    expect(clip.mimeType).toBe("audio/mpeg");
    expect(clip.generationId).toBe("gen-1");
  });

  it("explains a rejected key with the host", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response('{"error":{"message":"Bad key"}}', { status: 401 })) as unknown as typeof fetch;

    await expect(synthesizeSpeech({ connection, text: "Hello" })).rejects.toThrow(
      "Speech generation failed (401) from openrouter.ai: Bad key. The speech API key was missing or rejected."
    );
  });

  it("reports a web page answer as a wrong base URL", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response("<!doctype html><html></html>", { status: 200, headers: { "Content-Type": "text/html" } })) as unknown as typeof fetch;

    await expect(synthesizeSpeech({ connection, text: "Hello" })).rejects.toThrow("returned a web page, not a speech API.");
  });

  it("rejects an empty audio body", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response(new Uint8Array(0), { status: 200, headers: { "Content-Type": "audio/mpeg" } })) as unknown as typeof fetch;

    await expect(synthesizeSpeech({ connection, text: "Hello" })).rejects.toThrow("empty audio file");
  });

  it("keeps the input limit in view", () => {
    expect(MAX_SPEECH_CHARS).toBe(4000);
  });
});

describe("extensionForMime", () => {
  it("maps audio types to file extensions", () => {
    expect(extensionForMime("audio/mpeg")).toBe("mp3");
    expect(extensionForMime("audio/wav")).toBe("wav");
    expect(extensionForMime("audio/x-m4a")).toBe("m4a");
    expect(extensionForMime("audio/unknown")).toBe("mp3");
  });
});

describe("speech history", () => {
  const base = { text: "Hi", voice: "Zephyr", model: "m", generationId: null };

  it("puts the newest entry first and keeps the limit", () => {
    let list: SpeechEntry[] = [];
    for (let index = 0; index < HISTORY_LIMIT + 5; index += 1) {
      list = addEntry(list, makeEntry({ ...base, text: `item ${index}` }));
    }
    expect(list).toHaveLength(HISTORY_LIMIT);
    expect(list[0].text).toBe(`item ${HISTORY_LIMIT + 4}`);
  });

  it("drops entries without an id or text", () => {
    const entries = normalizeHistory([{ id: "a", text: "ok" }, { text: "no id" }, null]);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ id: "a", text: "ok", voice: "", generationId: null });
  });
});
