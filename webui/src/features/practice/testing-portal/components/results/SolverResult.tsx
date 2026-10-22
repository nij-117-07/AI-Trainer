// src/features/practice/testing-portal/components/results/SolverResult.tsx
/**
 * Shows the solver's chosen option and the reasoning behind it.
 */
"use client";

import { SearchCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { McqSolverResponse } from "../../types";

export function SolverResult({ result }: { result: McqSolverResponse }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <SearchCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Solution</h2>
          <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Correct option: {result.correct_option}
          </span>
        </div>
        <MarkdownContent content={result.reasoning} />
      </CardContent>
    </Card>
  );
}
