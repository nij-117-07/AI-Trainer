// src/features/linguistic/language-tester/components/results/TranslationChallengeResult.tsx
/**
 * Renders a translation challenge with its instruction and source text, the
 * key vocabulary to watch, a cultural tip, and a revealable reference answer.
 */
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { ChallengeResponse } from "../../types";

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

export function TranslationChallengeResult({ result }: { result: ChallengeResponse }) {
  const [attempt, setAttempt] = useState("");
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <MarkdownContent
            content={[
              result.test_type && `**Test type:** ${result.test_type}`,
              result.challenge_instruction && `## Your Task\n\n${result.challenge_instruction}`,
              result.source_text && `## Source Text\n\n> ${result.source_text}`,
              result.vocabulary_highlights.length
                ? `## Vocabulary to Watch\n\n${bulletList(result.vocabulary_highlights)}`
                : "",
              result.cultural_tip ? `## Cultural Tip\n\n${result.cultural_tip}` : "",
            ]
              .filter(Boolean)
              .join("\n\n---\n\n")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Your Attempt</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRevealed((current) => !current)}
              className="gap-1.5"
            >
              {revealed ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Hide Reference
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Reveal Reference
                </>
              )}
            </Button>
          </div>
          <Textarea
            className="min-h-32 resize-none bg-transparent"
            placeholder="Write your translation or explanation here…"
            value={attempt}
            onChange={(event) => setAttempt(event.target.value)}
          />
          {revealed && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Reference answer
              </p>
              <p className="mt-1 text-sm">{result.correct_reference}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
