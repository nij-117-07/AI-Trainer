// src/features/memory-helper/lib/signatures.test.ts
import { ax } from "@ax-llm/ax";
import { memoryAgentSignature } from "./signatures";

describe("memory helper signature", () => {
  it("builds a valid generator from the backend description", () => {
    expect(() => ax(memoryAgentSignature)).not.toThrow();
  });
});
