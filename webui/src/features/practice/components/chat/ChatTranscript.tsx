// src/features/practice/components/chat/ChatTranscript.tsx
/**
 * Scrollable message list shared by the practice chat-style apps. User messages
 * are right-aligned bubbles; assistant messages render markdown on the left.
 * Auto-scrolls to the latest message.
 */
"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PracticeChatMessage } from "./types";

interface ChatTranscriptProps {
  messages: PracticeChatMessage[];
  isPending: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function ChatTranscript({
  messages,
  isPending,
  emptyTitle = "No messages yet",
  emptyDescription = "Start the session and your conversation will appear here.",
  className,
}: ChatTranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isPending]);

  return (
    <ScrollArea className={cn("h-96", className)}>
      <div className="space-y-4 p-4">
        {messages.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <MessageSquare className="h-6 w-6 text-muted-foreground/60" />
            <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div key={index} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  isUser
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground"
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                ) : (
                  <div className="min-w-0">
                    <MarkdownContent
                      content={message.content}
                      className="max-w-none text-foreground"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isPending && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                  style={{ animationDelay: `${dot * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
