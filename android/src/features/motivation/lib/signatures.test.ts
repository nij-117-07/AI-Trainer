// src/features/motivation/lib/signatures.test.ts
import { ax } from "@ax-llm/ax";
import { motivationalQuoteSignature, reflectionPromptSignature } from "./signatures";

describe("motivation signatures", () => {
  it("builds valid generators from the backend descriptions", () => {
    expect(() => ax(motivationalQuoteSignature)).not.toThrow();
    expect(() => ax(reflectionPromptSignature)).not.toThrow();
  });
});
