// src/features/linguistic/language-tester/components/chat/RoleplayAssessTranscript.tsx
/**
 * Scrollable message list for the Roleplay Coach. User messages are
 * right-aligned bubbles; character messages render their markdown in a left
 * bubble plus a feedback panel with the grammatical critique, fluency score,
 * and suggested strategies. Auto-scrolls to the latest message.
 */
"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoleplayAssessUiMessage } from "../../types";

interface RoleplayAssessTranscriptProps {
  messages: RoleplayAssessUiMessage[];
  isPending: boolean;
}

export function RoleplayAssessTranscript({
  messages,
  isPending,
}: RoleplayAssessTranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isPending]);

  return (
    <ScrollArea className="h-[30rem]">
      <div className="space-y-4 p-4">
        {messages.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <Sparkles className="h-6 w-6 text-muted-foreground/60" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Deliver your first line and the character will respond in the target
              language while the coach grades your attempt.
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
                  <div className="min-w-0 space-y-3">
                    <MarkdownContent
                      content={message.content}
                      enableMath
                      className="max-w-none text-foreground"
                    />
                    {message.feedback && (
                      <div className="space-y-2 rounded-lg border border-border bg-card p-3">
                        <p className="flex items-center justify-between gap-2 text-xs font-medium">
                          <span className="flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5 text-muted-foreground" />
                            Coach Feedback
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5",
                              message.feedback.is_goal_achieved
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            Fluency {message.feedback.fluency_score}/10
                            {message.feedback.is_goal_achieved ? " · Goal reached" : ""}
                          </span>
                        </p>
                        {message.feedback.linguistic_critique && (
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {message.feedback.linguistic_critique}
                          </p>
                        )}
                        {message.feedback.suggested_strategies.length > 0 && (
                          <ul className="space-y-1">
                            {message.feedback.suggested_strategies.map((strategy) => (
                              <li
                                key={strategy}
                                className="text-xs text-muted-foreground"
                              >
                                • {strategy}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
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
