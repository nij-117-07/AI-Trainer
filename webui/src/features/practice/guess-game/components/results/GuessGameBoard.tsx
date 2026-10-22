// src/features/practice/guess-game/components/results/GuessGameBoard.tsx
/**
 * The in-progress Guess Game board: transcript of hints and guesses, guess
 * counter, and controls for guessing, asking for a hint, and getting coaching.
 */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LifeBuoy, Send, Sparkles } from "lucide-react";
import { ChatTranscript } from "@/features/practice/components/chat/ChatTranscript";
import type { GuessGameSession } from "../../types";

interface GuessGameBoardProps {
  session: GuessGameSession;
  isPending: boolean;
  error: string | null;
  onGuess: (guess: string) => void;
  onHint: () => void;
  onCoach: () => void;
}

export function GuessGameBoard({
  session,
  isPending,
  error,
  onGuess,
  onHint,
  onCoach,
}: GuessGameBoardProps) {
  const [guessText, setGuessText] = useState("");
  const canSubmit = guessText.trim().length > 0 && !isPending;
  const guessesLeft = Math.max(0, session.maxGuesses - session.guesses.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full border border-border px-2.5 py-0.5 font-medium capitalize">
            {session.category}
          </span>
          <span className="rounded-full border border-border px-2.5 py-0.5 font-medium capitalize">
            {session.difficulty}
          </span>
        </div>
        <span className="text-sm font-medium tabular-nums">
          Guesses used: {session.guesses.length} / {session.maxGuesses}
        </span>
      </div>

      {session.solved && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">Solved!</p>
          <p className="mt-1 text-muted-foreground">
            The answer was {session.mystery_item}. {session.fun_fact}
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <ChatTranscript
            messages={session.log}
            isPending={isPending}
            emptyTitle="Game started"
            emptyDescription="Your hints and guesses will appear here."
          />
          {!session.solved && (
            <div className="space-y-2 border-t p-3">
              <div className="flex items-end gap-2">
                <Input
                  value={guessText}
                  onChange={(event) => setGuessText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canSubmit) {
                      onGuess(guessText.trim());
                      setGuessText("");
                    }
                  }}
                  placeholder={guessesLeft === 0 ? "Out of guesses — keep trying!" : "Make a guess…"}
                  disabled={isPending}
                  className="flex-1 bg-transparent"
                />
                <Button
                  type="button"
                  size="icon"
                  disabled={!canSubmit}
                  onClick={() => {
                    onGuess(guessText.trim());
                    setGuessText("");
                  }}
                  aria-label="Submit guess"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  disabled={isPending}
                  onClick={onHint}
                >
                  <Sparkles className="h-4 w-4" />
                  Ask for a hint
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  disabled={isPending}
                  onClick={onCoach}
                >
                  <LifeBuoy className="h-4 w-4" />
                  Get coaching
                </Button>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
