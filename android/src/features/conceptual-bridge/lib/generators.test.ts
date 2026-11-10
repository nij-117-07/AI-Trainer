// src/features/conceptual-bridge/lib/generators.test.ts
import { generateBridge } from "./generators";
import type { AiSettings } from "@/features/ai-settings/types";
import type { BridgeFormValues } from "../types";

const configured: AiSettings = {
  modelName: "my-model",
  apiKey: "test-key",
  baseUrl: "https://gateway.example.com/v1",
  transcriptionModel: "",
  transcriptionBaseUrl: "",
  transcriptionApiKey: "",
  ttsModel: "",
  ttsVoice: "",
  ttsBaseUrl: "",
  ttsApiKey: "",
};

const valid: BridgeFormValues = {
  conceptA: "Photosynthesis",
  conceptB: "Blockchain",
  customUserInput: "",
};

describe("generateBridge input checks", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("rejects a blank first concept before calling the model", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(generateBridge(configured, { ...valid, conceptA: "   " })).rejects.toThrow(
      "First concept is required.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a concept longer than 200 characters", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(generateBridge(configured, { ...valid, conceptB: "x".repeat(201) })).rejects.toThrow(
      "Second concept must be 200 characters or fewer.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
