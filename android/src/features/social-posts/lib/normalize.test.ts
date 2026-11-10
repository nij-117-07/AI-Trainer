// src/features/social-posts/lib/normalize.test.ts
import { normalizeRevision, normalizeSocialPosts, restoreSocialPostResult } from "./normalize";

const CONTEXT = { platform: "LinkedIn", userQuery: "Failing fast" };

describe("normalizeSocialPosts", () => {
  it("reads each post, labels it, and drops posts without content", () => {
    const result = normalizeSocialPosts(
      {
        userMessage: " Lead with the lesson. ",
        postSuggestions: [
          { variantId: "1", content: " Ship early. ", designerNotes: "Short hook." },
          { variantId: 2, content: "Fail fast.", designerNotes: null },
          { variantId: "3", content: "  ", designerNotes: "Empty body" },
          "not a post",
        ],
      },
      CONTEXT,
    );
    expect(result.platform).toBe("LinkedIn");
    expect(result.userQuery).toBe("Failing fast");
    expect(result.userMessage).toBe("Lead with the lesson.");
    expect(result.posts.map((post) => [post.label, post.content, post.designerNotes, post.parentId])).toEqual([
      ["Variant 1", "Ship early.", "Short hook.", null],
      ["Variant 2", "Fail fast.", "", null],
    ]);
    expect(result.posts[0].id).not.toBe(result.posts[1].id);
  });

  it("numbers a post whose variant id is missing", () => {
    const result = normalizeSocialPosts({ postSuggestions: [{ content: "Hello" }] }, CONTEXT);
    expect(result.posts[0].label).toBe("Variant 1");
  });

  it("returns empty values when the model omits fields", () => {
    expect(normalizeSocialPosts({}, CONTEXT)).toEqual({
      platform: "LinkedIn",
      userQuery: "Failing fast",
      userMessage: "",
      posts: [],
    });
  });
});

describe("normalizeRevision", () => {
  it("returns the revised content and notes", () => {
    expect(normalizeRevision({ content: " Shorter post. ", designerNotes: null })).toEqual({
      content: "Shorter post.",
      designerNotes: "",
    });
  });

  it("rejects an empty revision", () => {
    expect(() => normalizeRevision({ content: "  " })).toThrow("The model returned an empty post.");
  });
});

describe("restoreSocialPostResult", () => {
  it("keeps valid posts and drops damaged ones", () => {
    const result = restoreSocialPostResult({
      platform: "X",
      userQuery: "Launch",
      userMessage: "Keep it short.",
      posts: [
        { id: "a", parentId: null, label: "Variant 1", content: "Hi", designerNotes: "" },
        { id: "", parentId: null, label: "Variant 2", content: "No id" },
        { id: "b", parentId: "a", label: "Variant 1 · Revision 1", content: "" },
        "not a post",
      ],
    });
    expect(result?.posts).toEqual([{ id: "a", parentId: null, label: "Variant 1", content: "Hi", designerNotes: "" }]);
  });

  it("returns null when the saved value is not an object", () => {
    expect(restoreSocialPostResult(null)).toBeNull();
    expect(restoreSocialPostResult(["x"])).toBeNull();
  });
});
