// src/features/linguistic/simulator/components/chat/SimulatorChatTranscript.tsx
/**
 * Scrollable message list for the Simulator Chat. User messages are
 * right-aligned bubbles; persona messages render their markdown through the
 * shared MarkdownContent component inside a left bubble, plus a muted line
 * revealing what the persona is thinking. Auto-scrolls to the latest message.
 */
"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimulatorUiChatMessage } from "../../types";

interface SimulatorChatTranscriptProps {
  messages: SimulatorUiChatMessage[];
  isPending: boolean;
}

export function SimulatorChatTranscript({
  messages,
  isPending,
}: SimulatorChatTranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isPending]);

  return (
    <ScrollArea className="h-[28rem]">
      <div className="space-y-4 p-4">
        {messages.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <Sparkles className="h-6 w-6 text-muted-foreground/60" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Deliver your first line and the persona will react, think, and reply
              in character.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div
              key={index}
              className={cn("flex", isUser ? "justify-end" : "justify-start")}
            >
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
                  <div className="min-w-0 space-y-2">
                    <MarkdownContent
                      content={message.content}
                      enableMath
                      className="max-w-none text-foreground"
                    />
                    {message.thought.trim() && (
                      <p className="border-t pt-2 text-xs italic text-muted-foreground">
                        What they&apos;re thinking: {message.thought.trim()}
                      </p>
                    )}
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
