// src/features/tools/creative-assets/components/results/CreativeAssetsResult.tsx
/**
 * Renders the Creative Assets output: one card per suggestion with its
 * explanation.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { CreativeAssetResponse } from "../../types";

export function CreativeAssetsResult({ result }: { result: CreativeAssetResponse }) {
  return (
    <div className="space-y-4">
      {result.suggestions.map((suggestion, index) => (
        <Card key={`${suggestion.suggestion}-${index}`}>
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <h3 className="text-base font-semibold">{suggestion.suggestion}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
