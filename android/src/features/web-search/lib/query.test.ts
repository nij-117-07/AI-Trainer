// src/features/web-search/lib/query.test.ts
import { MAX_QUERY_LENGTH, normalizeQuery, queryError } from "./query";

describe("normalizeQuery", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeQuery("  react   native\n\tnavigation  ")).toBe("react native navigation");
  });

  it("returns an empty string for non-string input", () => {
    expect(normalizeQuery(undefined)).toBe("");
    expect(normalizeQuery(42)).toBe("");
  });
});

describe("queryError", () => {
  it("rejects an empty query", () => {
    expect(queryError("")).toBe("Enter what you want to search for.");
  });

  it("rejects a query longer than the limit", () => {
    expect(queryError("a".repeat(MAX_QUERY_LENGTH + 1))).toBe(`Maximum ${MAX_QUERY_LENGTH} characters.`);
  });

  it("accepts a normal query", () => {
    expect(queryError("expo router")).toBeNull();
  });
});
