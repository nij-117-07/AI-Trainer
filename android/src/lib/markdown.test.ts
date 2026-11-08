import { parseInline, parseMarkdown } from "@/lib/markdown";

describe("parseMarkdown", () => {
  it("parses headings, paragraphs, and lists", () => {
    const blocks = parseMarkdown("# Title\n\nFirst line\ncontinued.\n\n- one\n- two\n\n1. step\n2. next");
    expect(blocks).toEqual([
      { type: "heading", level: 1, text: "Title" },
      { type: "paragraph", text: "First line continued." },
      { type: "bullets", items: ["one", "two"] },
      { type: "numbered", items: ["step", "next"] },
    ]);
  });

  it("keeps fenced code and quotes intact", () => {
    const blocks = parseMarkdown("```\nconst a = 1;\n- not a list\n```\n> quoted\n> more");
    expect(blocks).toEqual([
      { type: "code", text: "const a = 1;\n- not a list" },
      { type: "quote", text: "quoted\nmore" },
    ]);
  });

  it("returns no blocks for empty input", () => {
    expect(parseMarkdown("  \n\n")).toEqual([]);
  });
});

describe("parseInline", () => {
  it("marks bold, italic, and code segments", () => {
    expect(parseInline("A **key** term, *soft* and `code`.")).toEqual([
      { text: "A " },
      { text: "key", bold: true },
      { text: " term, " },
      { text: "soft", italic: true },
      { text: " and " },
      { text: "code", code: true },
      { text: "." },
    ]);
  });

  it("leaves plain text alone", () => {
    expect(parseInline("plain text")).toEqual([{ text: "plain text" }]);
  });
});
