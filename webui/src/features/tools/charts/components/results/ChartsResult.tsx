// src/features/tools/charts/components/results/ChartsResult.tsx
/**
 * Renders the Chart.js Generator output: the explanation message, a live
 * interactive chart preview (pan/zoom/download/copy), and the generated
 * HTML/JS code block.
 */
"use client";

import { Play } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { ChartPreview } from "./ChartPreview";
import type { ChartResponse } from "../../types";

interface ChartsResultProps {
  result: ChartResponse;
  /** The code to display/render (generated output or custom/restored previous code). */
  previewCode: string;
  /** Re-renders the current Previous Code value into the preview. */
  onRender: () => void;
}

export function ChartsResult({ result, previewCode, onRender }: ChartsResultProps) {
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
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={onRender}
              disabled={!previewCode.trim()}
            >
              <Play className="h-4 w-4" />
              Render
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="p-5">
          <ChartPreview code={previewCode} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold">Chart.js code</h3>
          <CodeBlock
            code={previewCode || result.chart_div_code}
            language="html"
            filename="chart.html"
          />
        </CardContent>
      </Card>
    </div>
  );
}
