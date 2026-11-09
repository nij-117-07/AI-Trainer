// src/features/brain-dump/types.ts

export interface Note {
  id: string;
  /** Optional. When empty, the first line of the body is shown instead. */
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotePatch = Partial<Pick<Note, "title" | "body" | "pinned">>;
