// src/features/voice-notes/lib/notes.test.ts
import { createNote, formatDuration, makeNoteTitle, normalizeNotes, previewText, sortNotes } from "./notes";
import { formatFromMimeType, formatFromUri } from "./audio";
import type { VoiceNote } from "../types";

describe("makeNoteTitle", () => {
  it("uses the first six words and an ellipsis when there are more", () => {
    expect(makeNoteTitle("one two three four five six seven", new Date(0))).toBe("one two three four five six…");
  });

  it("keeps short text whole", () => {
    expect(makeNoteTitle("  buy   milk  ", new Date(0))).toBe("buy milk");
  });
});

describe("createNote", () => {
  it("trims text, rounds the duration, and stamps both dates", () => {
    const now = new Date("2026-11-09T10:00:00.000Z");
    const note = createNote({ text: "  Call the bank  ", model: "asr", durationMs: 1234.6, now });
    expect(note.text).toBe("Call the bank");
    expect(note.durationMs).toBe(1235);
    expect(note.createdAt).toBe(now.toISOString());
    expect(note.updatedAt).toBe(now.toISOString());
    expect(note.id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });
});

describe("normalizeNotes", () => {
  it("drops entries without an id or text and fills missing fields", () => {
    const notes = normalizeNotes([
      { id: "a", text: "hello", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: 5, text: "bad id" },
      null,
      "junk",
    ]);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ id: "a", title: "hello", model: "", durationMs: 0 });
  });

  it("returns an empty list for non-array data", () => {
    expect(normalizeNotes({ id: "a" })).toEqual([]);
  });
});

describe("sortNotes", () => {
  it("puts the newest note first without mutating the input", () => {
    const base = { title: "", text: "", model: "", durationMs: 0, updatedAt: "" };
    const older: VoiceNote = { ...base, id: "1", createdAt: "2026-01-01T00:00:00.000Z" };
    const newer: VoiceNote = { ...base, id: "2", createdAt: "2026-02-01T00:00:00.000Z" };
    const input = [older, newer];
    expect(sortNotes(input).map((note) => note.id)).toEqual(["2", "1"]);
    expect(input[0]).toBe(older);
  });
});

describe("labels", () => {
  it("formats durations as m:ss", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65_900)).toBe("1:05");
  });

  it("collapses whitespace and truncates previews", () => {
    expect(previewText("a   b\n c")).toBe("a b c");
    expect(previewText("x".repeat(10), 4)).toBe("xxxx…");
  });
});

describe("audio format detection", () => {
  it("reads the extension from a file URI", () => {
    expect(formatFromUri("file:///data/Audio/rec-1.m4a")).toBe("m4a");
    expect(formatFromUri("blob:https://app/abc")).toBeNull();
  });

  it("maps a MIME type to an endpoint format", () => {
    expect(formatFromMimeType("audio/webm;codecs=opus")).toBe("webm");
    expect(formatFromMimeType("audio/mpeg")).toBe("mp3");
    expect(formatFromMimeType("video/mp4")).toBeNull();
  });
});
