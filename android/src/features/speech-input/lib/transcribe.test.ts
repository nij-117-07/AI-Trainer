// src/features/speech-input/lib/transcribe.test.ts
import { isVoiceConfigured, resolveVoiceConnection } from "@/features/ai-settings/lib/voice";
import type { AiSettings } from "@/features/ai-settings/types";
import { extractErrorMessage } from "@/lib/provider-errors";
import { buildTranscriptionBody, extractTranscript, transcribeAudio, transcriptionEndpoint } from "./transcribe";

const chat: AiSettings = {
  modelName: "chat-model",
  apiKey: "chat-key",
  baseUrl: "https://chat.example.com/v1/",
  transcriptionModel: "",
  transcriptionBaseUrl: "",
  transcriptionApiKey: "",
  ttsModel: "",
  ttsVoice: "",
  ttsBaseUrl: "",
  ttsApiKey: "",
};

const connection = {
  baseUrl: "https://openrouter.ai/api/v1/",
  apiKey: "voice-key",
  model: "nvidia/nemotron-3.5-asr-streaming-multilingual-0.6b",
};

describe("resolveVoiceConnection", () => {
  it("falls back to the chat base URL and key when the voice ones are empty", () => {
    const resolved = resolveVoiceConnection({ ...chat, transcriptionModel: " whisper " });
    expect(resolved).toEqual({ baseUrl: "https://chat.example.com/v1/", apiKey: "chat-key", model: "whisper" });
  });

  it("uses its own base URL and key when they are set", () => {
    const resolved = resolveVoiceConnection({
      ...chat,
      transcriptionModel: "whisper",
      transcriptionBaseUrl: " https://openrouter.ai/api/v1 ",
      transcriptionApiKey: "voice-key",
    });
    expect(resolved).toEqual({ baseUrl: "https://openrouter.ai/api/v1", apiKey: "voice-key", model: "whisper" });
  });
});

describe("isVoiceConfigured", () => {
  it("needs a base URL, key, and model", () => {
    expect(isVoiceConfigured(connection)).toBe(true);
    expect(isVoiceConfigured({ ...connection, baseUrl: "" })).toBe(false);
    expect(isVoiceConfigured({ ...connection, apiKey: "" })).toBe(false);
    expect(isVoiceConfigured({ ...connection, model: "" })).toBe(false);
  });
});

describe("transcriptionEndpoint", () => {
  it("appends /audio/transcriptions without a doubled slash", () => {
    expect(transcriptionEndpoint("https://openrouter.ai/api/v1/")).toBe(
      "https://openrouter.ai/api/v1/audio/transcriptions"
    );
  });
});

describe("buildTranscriptionBody", () => {
  it("matches the OpenRouter input_audio shape", () => {
    const body = JSON.parse(buildTranscriptionBody(" model-x ", "AAAA", "m4a"));
    expect(body).toEqual({ model: "model-x", input_audio: { data: "AAAA", format: "m4a" } });
  });
});

describe("extractTranscript and extractErrorMessage", () => {
  it("reads the text field and ignores bad bodies", () => {
    expect(extractTranscript('{"text":"  hello there "}')).toBe("hello there");
    expect(extractTranscript('{"text":42}')).toBe("");
    expect(extractTranscript("not json")).toBe("");
  });

  it("prefers the nested error message", () => {
    expect(extractErrorMessage('{"error":{"message":"Bad key"}}')).toBe("Bad key");
    expect(extractErrorMessage('{"message":"Rate limited"}')).toBe("Rate limited");
    expect(extractErrorMessage("<html>oops</html>")).toBe("<html>oops</html>");
    expect(extractErrorMessage("   ")).toBe("No details returned.");
  });
});

describe("transcribeAudio", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("posts JSON with a bearer key and returns the transcript", async () => {
    const fetchMock = jest.fn().mockResolvedValue(new Response('{"text":"Buy milk"}', { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const text = await transcribeAudio({ connection, audioBase64: "AAAA", format: "m4a" });

    expect(text).toBe("Buy milk");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/audio/transcriptions");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer voice-key");
    expect(JSON.parse(init.body as string).input_audio.format).toBe("m4a");
  });

  it("throws the provider message on an HTTP error", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response('{"error":{"message":"Model not found"}}', { status: 404 })) as unknown as typeof fetch;

    await expect(transcribeAudio({ connection, audioBase64: "AAAA", format: "m4a" })).rejects.toThrow(
      "Transcription failed (404) from openrouter.ai: Model not found."
    );
  });

  it("explains a rejected voice key and which host rejected it", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response('{"error":{"message":"Missing Authentication header"}}', { status: 401 })) as unknown as typeof fetch;

    await expect(transcribeAudio({ connection, audioBase64: "AAAA", format: "m4a" })).rejects.toThrow(
      "Transcription failed (401) from openrouter.ai: Missing Authentication header. The voice API key was missing or rejected."
    );
  });

  it("reports a web page answer as a wrong base URL", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(new Response("<!doctype html><html></html>", { status: 200 })) as unknown as typeof fetch;

    await expect(transcribeAudio({ connection, audioBase64: "AAAA", format: "m4a" })).rejects.toThrow(
      "openrouter.ai returned a web page, not a speech API."
    );
  });

  it("throws when the model returns no transcript", async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response("{}", { status: 200 })) as unknown as typeof fetch;

    await expect(transcribeAudio({ connection, audioBase64: "AAAA", format: "m4a" })).rejects.toThrow(
      "The model returned no transcript"
    );
  });
});
