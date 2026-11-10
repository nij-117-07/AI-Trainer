// src/lib/navigation.test.ts
import { hubPathFor } from "./navigation";

describe("hubPathFor", () => {
  it("returns the hub that owns a nested page", () => {
    expect(hubPathFor("/tools/text-to-speech")).toBe("/tools");
    expect(hubPathFor("/language-learner/simulator/chat")).toBe("/language-learner");
    expect(hubPathFor("/learning/explainer/feynman")).toBe("/learning");
  });

  it("falls back to the dashboard for pages outside a hub", () => {
    expect(hubPathFor("/admin/settings")).toBe("/");
    expect(hubPathFor("/")).toBe("/");
  });
});
