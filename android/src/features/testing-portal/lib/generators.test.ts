// src/features/testing-portal/lib/generators.test.ts
import { generateMcqs, gradeAnswer, solveMcq } from "./generators";
import { AiNotConfiguredError, createLlm } from "@/features/ai-settings/lib/llm";
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

describe("createLlm", () => {
  it("refuses to build a client without a model name and API key", () => {
    expect(() => createLlm({ ...configured, modelName: "" })).toThrow(AiNotConfiguredError);
    expect(() => createLlm({ ...configured, apiKey: "  " })).toThrow(AiNotConfiguredError);
  });
});

describe("generators", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends the request to the saved base URL with the saved key and model", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "bad key" } }), {
        status: 401,
        headers: { "content-type": "application/json" },
      })
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      generateMcqs(configured, {
        topic: "Caching",
        questionType: "academic",
        numQuestions: 2,
        difficultyLevel: "beginner",
        contextSetting: "University Exam",
        customInstructions: "",
        pastQuestions: "",
      })
    ).rejects.toThrow();

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("https://gateway.example.com/v1");
    expect((init as RequestInit).headers).toEqual(
      expect.objectContaining({ Authorization: "Bearer test-key" })
    );
    expect(String((init as RequestInit).body)).toContain("my-model");
  });

  it("rejects an empty topic before calling the model", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      solveMcq(configured, {
        question: "",
        context: "",
        options: { A: "a", B: "b", C: "c", D: "d" },
      })
    ).rejects.toThrow("Question is required.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses to grade without a written answer or an image", async () => {
    const fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      gradeAnswer(configured, {
        scenario: "Interview",
        questionAsked: "Explain caching.",
        targetObjective: "Mentions invalidation",
        expectedLevel: "advanced",
        userAnswerText: "   ",
        image: null,
      })
    ).rejects.toThrow("Write an answer or attach an image before grading.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
