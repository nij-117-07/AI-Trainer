// src/features/tools/prompt-generator/components/results/PromptGeneratorResult.tsx
/**
 * Renders the generated persona: its name, the full system prompt in a
 * copyable code block, and the seed used for replication.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { Hash } from "lucide-react";
import type { PersonaResponse } from "../../types";

export function PromptGeneratorResult({ result }: { result: PersonaResponse }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Persona name
          </p>
          <h2 className="text-xl font-semibold">{result.persona_name}</h2>
        </div>

        <CodeBlock
          code={result.generated_persona_system_prompt}
          language="text"
          filename="system-prompt.txt"
        />

        {result.seed_used && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <Hash className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">Seed used:</span>
            <code className="font-mono font-medium">{result.seed_used}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
