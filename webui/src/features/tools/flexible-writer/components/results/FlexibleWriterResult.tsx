// src/features/tools/flexible-writer/components/results/FlexibleWriterResult.tsx
/**
 * Renders the Flexible Writer output: the transformed data in a copyable
 * code block (pretty-printed when the result is JSON) plus the summary message.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { FlexibleWriterResponse } from "../../types";

function stringifyData(data: unknown): string {
  if (typeof data === "string") return data;
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export function FlexibleWriterResult({ result }: { result: FlexibleWriterResponse }) {
  const updatedData = stringifyData(result.updated_data);

  return (
    <div className="space-y-4">
      {result.answer_message.trim() && (
        <Card>
          <CardContent className="p-5">
            <MarkdownContent content={result.answer_message} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold">Transformed data</h3>
          <CodeBlock
            code={updatedData}
            language="text"
            filename="result.txt"
          />
        </CardContent>
      </Card>
    </div>
  );
}
