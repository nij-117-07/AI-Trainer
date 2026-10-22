// src/features/tools/ingredients/components/results/IngredientsResult.tsx
/**
 * Renders the Ingredients Checker output: a colored health-level badge with
 * its meaning, the extracted ingredients as chips, risk factors, and the
 * analysis summary.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { cn } from "@/lib/utils";
import type { HealthLevel, IngredientAnalysisResponse } from "../../types";

const HEALTH_LEVEL_INFO: Record<
  HealthLevel,
  { label: string; description: string; className: string }
> = {
  1: {
    label: "1 / 5",
    description: "Ultra-processed / harmful additives (avoid)",
    className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  },
  2: {
    label: "2 / 5",
    description: "High sugar/sodium or artificial preservatives",
    className: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  },
  3: {
    label: "3 / 5",
    description: "Moderately processed but generally safe",
    className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  },
  4: {
    label: "4 / 5",
    description: "Whole foods with minimal processing",
    className: "bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-500/30",
  },
  5: {
    label: "5 / 5",
    description: "Organic / pure / highly nutritious (excellent)",
    className: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  },
};

export function IngredientsResult({ result }: { result: IngredientAnalysisResponse }) {
  const levelInfo = HEALTH_LEVEL_INFO[result.health_level];

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-sm font-semibold",
              levelInfo.className
            )}
          >
            Health level {levelInfo.label}
          </span>
          <span className="text-sm text-muted-foreground">{levelInfo.description}</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Detected ingredients</h3>
          {result.extracted_ingredients.length ? (
            <div className="flex flex-wrap gap-2">
              {result.extracted_ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="rounded-md bg-muted px-2.5 py-1 text-sm"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No ingredients detected.</p>
          )}
        </div>

        {result.risk_factors.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Risk factors</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {result.risk_factors.map((risk) => (
                <li key={risk}>{risk}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-semibold">Analysis</h3>
          <MarkdownContent content={result.summary_analysis} />
        </div>
      </CardContent>
    </Card>
  );
}
