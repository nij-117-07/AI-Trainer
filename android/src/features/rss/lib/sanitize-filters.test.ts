import { DEFAULT_VIEWER_FILTERS, sanitizeViewerFilters } from "./viewer-filters";

describe("sanitizeViewerFilters", () => {
  it("keeps valid saved filters", () => {
    const saved = { feedId: "abc", category: "Tech", search: "ai", timeRange: "7d" as const };
    expect(sanitizeViewerFilters(saved)).toEqual(saved);
  });

  it("falls back to all time for an unknown time range", () => {
    const restored = sanitizeViewerFilters({ ...DEFAULT_VIEWER_FILTERS, timeRange: "1y" as never });
    expect(restored.timeRange).toBe("all");
  });

  it("falls back to defaults for fields with the wrong type", () => {
    const restored = sanitizeViewerFilters({ feedId: 3, category: null, search: ["x"], timeRange: "24h" } as never);
    expect(restored).toEqual({ ...DEFAULT_VIEWER_FILTERS, timeRange: "24h" });
  });
});
