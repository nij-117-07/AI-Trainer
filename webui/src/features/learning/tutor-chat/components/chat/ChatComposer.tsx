// src/features/learning/tutor-chat/components/chat/ChatComposer.tsx
/**
 * Bottom composer for the Tutor Chat: an autosizing textarea with a send
 * button. Enter submits, Shift+Enter inserts a newline. Disabled while a turn
 * is pending or the input is empty.
 */
"use client";

import type { KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
  placeholder?: string;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isPending,
  placeholder = "Ask a follow-up question…",
}: ChatComposerProps) {
  const canSubmit = value.trim().length > 0 && !isPending;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSubmit) onSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t p-3">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={isPending}
        className="min-h-16 max-h-40 flex-1 resize-none bg-transparent"
      />
      <Button
        type="button"
        size="icon"
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-label="Send message"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
