// src/features/diagram/lib/persistence.test.ts
import { DEFAULT_DRAFT, DEFAULT_FORM } from "../options";
import type { DiagramVersion } from "../types";
import { appendVersion, MAX_VERSIONS, parseVersions, restoreDraft, restoreForm } from "./persistence";

function version(index: number): DiagramVersion {
  return { code: `graph TD\nA${index}-->B`, format: "mermaid", savedAt: `2026-01-01T00:00:${index}.000Z` };
}

describe("restoreDraft", () => {
  it("returns the defaults when nothing was saved", () => {
    expect(restoreDraft(null)).toEqual(DEFAULT_DRAFT);
  });

  it("keeps a saved result and previews", () => {
    const draft = restoreDraft({
      form: { format: "drawio", instruction: "Auth flow" },
      result: { code: "<mxGraphModel/>", format: "drawio", message: "Built it" },
      previewDrawio: "<mxGraphModel/>",
    });
    expect(draft.form.format).toBe("drawio");
    expect(draft.form.instruction).toBe("Auth flow");
    expect(draft.form.context).toBe(DEFAULT_FORM.context);
    expect(draft.result).toEqual({ code: "<mxGraphModel/>", format: "drawio", message: "Built it" });
    expect(draft.previewDrawio).toBe("<mxGraphModel/>");
    expect(draft.previewMermaid).toBe("");
  });

  it("drops a result with an unknown format", () => {
    expect(restoreDraft({ result: { code: "x", format: "svg" } }).result).toBeNull();
  });
});

describe("restoreForm", () => {
  it("falls back to the default format and text for bad values", () => {
    expect(restoreForm({ format: "svg", instruction: 12 })).toEqual(DEFAULT_FORM);
  });
});

describe("parseVersions and appendVersion", () => {
  it("drops malformed entries", () => {
    const parsed = parseVersions([version(1), { code: 4, format: "mermaid", savedAt: "x" }, null]);
    expect(parsed).toEqual([version(1)]);
  });

  it("keeps only the newest versions", () => {
    let list: DiagramVersion[] = [];
    for (let index = 0; index < MAX_VERSIONS + 5; index += 1) {
      list = appendVersion(list, version(index));
    }
    expect(list).toHaveLength(MAX_VERSIONS);
    expect(list[0]).toEqual(version(5));
  });
});
