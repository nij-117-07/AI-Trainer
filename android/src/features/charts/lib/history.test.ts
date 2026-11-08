// src/features/charts/lib/history.test.ts
import { MAX_VERSIONS, appendVersion, codeSnippet, parseHistory } from "./history";

describe("parseHistory", () => {
  it("keeps only well-formed versions", () => {
    expect(
      parseHistory([
        { code: "<div>a</div>", savedAt: "2026-01-01T00:00:00.000Z" },
        { code: 3, savedAt: "2026-01-01T00:00:00.000Z" },
        null,
      ]),
    ).toEqual([{ code: "<div>a</div>", savedAt: "2026-01-01T00:00:00.000Z" }]);
  });

  it("returns an empty list for a non-list value", () => {
    expect(parseHistory({ code: "x" })).toEqual([]);
  });
});

describe("appendVersion", () => {
  it("caps the history at the newest versions", () => {
    let versions = [] as ReturnType<typeof parseHistory>;
    for (let i = 0; i < MAX_VERSIONS + 5; i += 1) {
      versions = appendVersion(versions, `code ${i}`, `t${i}`);
    }
    expect(versions).toHaveLength(MAX_VERSIONS);
    expect(versions[0].code).toBe("code 5");
    expect(versions[MAX_VERSIONS - 1].code).toBe(`code ${MAX_VERSIONS + 4}`);
  });
});

describe("codeSnippet", () => {
  it("uses the first non-empty line and shortens long lines", () => {
    expect(codeSnippet("\n  \n<canvas id=\"chart\"></canvas>")).toBe('<canvas id="chart"></canvas>');
    expect(codeSnippet("x".repeat(60))).toBe(`${"x".repeat(48)}…`);
  });
});
