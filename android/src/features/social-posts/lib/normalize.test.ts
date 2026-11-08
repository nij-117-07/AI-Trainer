// src/features/social-posts/lib/normalize.test.ts
import { normalizeSocialPosts } from "./normalize";

describe("normalizeSocialPosts", () => {
  it("reads each post and drops posts without content", () => {
    const result = normalizeSocialPosts({
      userMessage: " Lead with the lesson. ",
      postSuggestions: [
        { variantId: "1", content: " Ship early. ", designerNotes: "Short hook." },
        { variantId: 2, content: "Fail fast.", designerNotes: null },
        { variantId: "3", content: "  ", designerNotes: "Empty body" },
        "not a post",
      ],
    });
    expect(result).toEqual({
      userMessage: "Lead with the lesson.",
      postSuggestions: [
        { variantId: "1", content: "Ship early.", designerNotes: "Short hook." },
        { variantId: "2", content: "Fail fast.", designerNotes: "" },
      ],
    });
  });

  it("numbers a post whose variant id is missing", () => {
    const result = normalizeSocialPosts({ postSuggestions: [{ content: "Hello" }] });
    expect(result.postSuggestions[0].variantId).toBe("1");
  });

  it("returns empty values when the model omits fields", () => {
    expect(normalizeSocialPosts({})).toEqual({ userMessage: "", postSuggestions: [] });
  });
});
