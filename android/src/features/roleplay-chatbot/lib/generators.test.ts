// src/features/roleplay-chatbot/lib/generators.test.ts
import { sendTurn } from "./generators";
import type { AiSettings } from "@/features/ai-settings/types";

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

describe("sendTurn input checks", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("rejects a blank persona before calling the model", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      sendTurn(configured, { systemPrompt: " ", characterName: "Elara", history: [], userInput: "Hi" }),
    ).rejects.toThrow("Persona is required.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a blank message before calling the model", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      sendTurn(configured, { systemPrompt: "A wizard.", characterName: "", history: [], userInput: "" }),
    ).rejects.toThrow("Message is required.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
