// src/features/learning/roadmap/components/InlineEditForm.tsx
/**
 * Inline rename form: swaps the item title for an input with save/cancel.
 * Mounts fresh on every edit, so the draft always starts from the current
 * title (no effect syncing needed).
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

interface InlineEditFormProps {
  initialValue: string;
  onSave: (title: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function InlineEditForm({
  initialValue,
  onSave,
  onCancel,
  disabled,
}: InlineEditFormProps) {
  const [draft, setDraft] = useState(initialValue);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    onSave(title);
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 items-center gap-1.5">
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onCancel();
        }}
        autoFocus
        disabled={disabled}
        className="h-8 min-w-0 flex-1 bg-transparent"
      />
      <Button type="submit" size="icon-sm" variant="ghost" disabled={disabled} aria-label="Save name">
        <Check className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={disabled}
        aria-label="Cancel edit"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </form>
  );
}
