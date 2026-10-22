// src/features/tools/social-posts/components/results/SocialPostsResult.tsx
/**
 * Renders Social Post Generator output: the strategy message plus one card
 * per suggested post with its designer notes.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { SocialPostResponse } from "../../types";

export function SocialPostsResult({ result }: { result: SocialPostResponse }) {
  return (
    <div className="space-y-4">
      {result.user_message.trim() && (
        <Card>
          <CardContent className="p-5">
            <MarkdownContent content={result.user_message} />
          </CardContent>
        </Card>
      )}

      {result.post_suggestions.map((suggestion) => (
        <Card key={suggestion.variant_id}>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {suggestion.variant_id}
              </span>
              <h3 className="text-sm font-semibold">Post variant</h3>
            </div>
            <MarkdownContent content={suggestion.content} />
            <p className="border-t pt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Designer notes:</span>{" "}
              {suggestion.designer_notes}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
