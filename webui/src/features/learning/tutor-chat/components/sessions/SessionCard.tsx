// src/features/learning/tutor-chat/components/sessions/SessionCard.tsx
/**
 * A single saved session row for the picker: shows the master topic, how long
 * ago it was updated, the message count, and a preview of the last message.
 * Clicking opens the session; a delete button is exposed to the parent.
 */
"use client";

import { MessagesSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TutorChatSessionSummary } from "../../types";

/** Compact relative time, e.g. "3h ago", "2d ago", "Aug 1". */
function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface SessionCardProps {
  session: TutorChatSessionSummary;
  onOpen: (id: string) => void;
  onDelete: (session: TutorChatSessionSummary) => void;
  disabled?: boolean;
}

export function SessionCard({ session, onOpen, onDelete, disabled }: SessionCardProps) {
  const relative = relativeTime(session.updatedAt);

  return (
    <Card
      className="group cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(session.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(session.id);
        }
      }}
      aria-label={`Open session: ${session.master_topic}`}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessagesSquare className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold">{session.master_topic}</h3>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete session ${session.master_topic}`}
              className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(session);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {session.lastMessage || "No messages yet."}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {session.messageCount} {session.messageCount === 1 ? "message" : "messages"}
            {" · "}
            {relative}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
