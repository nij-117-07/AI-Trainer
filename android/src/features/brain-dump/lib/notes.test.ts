// src/features/brain-dump/lib/notes.test.ts
import type { Note } from "../types";
import {
  allTags,
  createNote,
  deriveTitle,
  displayTitle,
  extractTags,
  filterNotes,
  normalizeNotes,
  sortNotes,
} from "./notes";

function note(overrides: Partial<Note>): Note {
  return {
    id: "n",
    title: "",
    body: "",
    pinned: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("createNote", () => {
  it("trims the body and takes the title from the first line", () => {
    const created = createNote({ body: "  Call the bank\nand ask about fees  ", now: new Date(2026, 0, 1) });
    expect(created.body).toBe("Call the bank\nand ask about fees");
    expect(created.title).toBe("Call the bank");
    expect(created.pinned).toBe(false);
  });
});

describe("deriveTitle", () => {
  it("skips blank lines and shortens long first lines", () => {
    expect(deriveTitle("\n\n  Ideas  \nmore")).toBe("Ideas");
    expect(deriveTitle("x".repeat(100))).toHaveLength(60);
    expect(deriveTitle("   ")).toBe("");
  });
});

describe("displayTitle", () => {
  it("falls back from title to first line to a placeholder", () => {
    expect(displayTitle(note({ title: "Named", body: "other" }))).toBe("Named");
    expect(displayTitle(note({ body: "First line" }))).toBe("First line");
    expect(displayTitle(note({}))).toBe("Untitled note");
  });
});

describe("extractTags", () => {
  it("finds lowercase, unique #tags", () => {
    expect(extractTags("Ideas #Work #work #home-lab, not #  space")).toEqual(["home-lab", "work"]);
  });

  it("ignores a lone hash sign", () => {
    expect(extractTags("# heading and C# code")).toEqual([]);
  });
});

describe("normalizeNotes", () => {
  it("returns an empty list for non-array data", () => {
    expect(normalizeNotes(null)).toEqual([]);
    expect(normalizeNotes({})).toEqual([]);
  });

  it("drops entries without an id or any text and repairs bad fields", () => {
    const result = normalizeNotes([
      { id: "a", body: "Keep me", pinned: "yes", createdAt: "not-a-date" },
      { id: "b", title: "  ", body: "   " },
      { body: "No id" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "a", body: "Keep me", pinned: false });
    expect(Number.isNaN(Date.parse(result[0].createdAt))).toBe(false);
  });
});

describe("sortNotes", () => {
  it("puts pinned notes first, then the most recently updated", () => {
    const sorted = sortNotes([
      note({ id: "old", updatedAt: "2026-01-01T00:00:00.000Z" }),
      note({ id: "new", updatedAt: "2026-03-01T00:00:00.000Z" }),
      note({ id: "pinned", pinned: true, updatedAt: "2025-01-01T00:00:00.000Z" }),
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["pinned", "new", "old"]);
  });
});

describe("filterNotes", () => {
  const notes = [
    note({ id: "a", body: "Buy milk #errands", updatedAt: "2026-01-01T00:00:00.000Z" }),
    note({ id: "b", title: "Project", body: "Plan the launch #work", updatedAt: "2026-02-01T00:00:00.000Z" }),
    note({ id: "c", body: "Ship it #Work", updatedAt: "2026-03-01T00:00:00.000Z" }),
  ];

  it("matches the search text case-insensitively", () => {
    expect(filterNotes(notes, { query: "LAUNCH", tag: null }).map((item) => item.id)).toEqual(["b"]);
  });

  it("keeps only notes with the selected tag", () => {
    expect(filterNotes(notes, { query: "", tag: "work" }).map((item) => item.id)).toEqual(["c", "b"]);
  });

  it("combines search and tag", () => {
    expect(filterNotes(notes, { query: "milk", tag: "work" })).toEqual([]);
  });
});

describe("allTags", () => {
  it("lists every tag once, sorted", () => {
    const notes = [note({ body: "#b #a" }), note({ body: "#a #c" })];
    expect(allTags(notes)).toEqual(["a", "b", "c"]);
  });
});
