// src/features/rss/lib/validation.test.ts
import { isHttpUrl, normalizeFeedConfig, normalizeFeeds, normalizeFeedItem, validateFeedInput } from "./validation";

const valid = {
  name: "  Hacker News ",
  url: "https://news.ycombinator.com/rss",
  category: "Tech",
  enabled: true,
  refreshIntervalMinutes: 30,
};

describe("validateFeedInput", () => {
  it("accepts valid input and trims text fields", () => {
    const result = validateFeedInput(valid);
    expect(result).toEqual({ ok: true, value: { ...valid, name: "Hacker News" } });
  });

  it("defaults enabled to true and the interval to 60 minutes when missing", () => {
    const result = validateFeedInput({ name: "A", url: "http://a.example/feed", category: "News" });
    expect(result).toEqual({
      ok: true,
      value: { name: "A", url: "http://a.example/feed", category: "News", enabled: true, refreshIntervalMinutes: 60 },
    });
  });

  it("reports one error per invalid field", () => {
    const result = validateFeedInput({ name: "  ", url: "ftp://example.com/feed", category: "", refreshIntervalMinutes: 0 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toEqual({
      name: "Name is required",
      url: "Enter a valid URL",
      category: "Category is required",
      refreshIntervalMinutes: "Choose an interval between 1 and 1440 minutes",
    });
  });

  it("rejects overlong names and non-integer intervals", () => {
    const result = validateFeedInput({ ...valid, name: "x".repeat(121), refreshIntervalMinutes: 2.5 });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.name).toMatch(/120 characters/);
    expect(result.errors.refreshIntervalMinutes).toBeDefined();
  });

  it("handles non-object input without throwing", () => {
    expect(validateFeedInput(null).ok).toBe(false);
    expect(validateFeedInput("text").ok).toBe(false);
  });
});

describe("isHttpUrl", () => {
  it("allows only http and https URLs", () => {
    expect(isHttpUrl("https://example.com/rss.xml")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("file:///etc/passwd")).toBe(false);
    expect(isHttpUrl("https://")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
  });
});

describe("normalizeFeeds", () => {
  it("keeps valid stored feeds and drops broken entries", () => {
    const stored = [
      { id: "f1", ...valid, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" },
      { id: "", ...valid },
      { id: "f2", name: "", url: "https://x.example", category: "Tech" },
      "garbage",
    ];
    const feeds = normalizeFeeds(stored);
    expect(feeds.map((feed) => feed.id)).toEqual(["f1"]);
    expect(feeds[0].name).toBe("Hacker News");
  });

  it("returns an empty list for non-array storage", () => {
    expect(normalizeFeeds({ id: "f1" })).toEqual([]);
    expect(normalizeFeeds(null)).toEqual([]);
  });

  it("fills missing timestamps with empty strings", () => {
    expect(normalizeFeedConfig({ id: "f9", ...valid })).toMatchObject({ createdAt: "", updatedAt: "" });
  });
});

describe("normalizeFeedItem", () => {
  it("guards every field and drops items without a guid", () => {
    expect(normalizeFeedItem({ title: "No guid" })).toBeNull();
    expect(
      normalizeFeedItem({ guid: "g", categories: ["a", 3, null], media: { url: 9 }, title: 5 }),
    ).toEqual({
      guid: "g",
      title: "Untitled",
      link: "",
      description: "",
      content: "",
      pubDate: "",
      author: "",
      categories: ["a"],
      media: undefined,
      feedId: "",
      feedName: "",
    });
  });
});
