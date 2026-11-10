import { messageEditSignature, messageRefinerSignature } from "./signatures";

describe("message refiner signatures", () => {
  it("builds without a field name used as both input and output", () => {
    expect(() => messageRefinerSignature).not.toThrow();
    expect(() => messageEditSignature).not.toThrow();
  });
});
