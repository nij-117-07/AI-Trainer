// src/features/tools/vision-converter/components/results/VisionConverterResult.tsx
/**
 * Renders the Vision Converter output with an editor/preview toggle.
 * Copy button copies the exact raw Markdown; a switch flips between a
 * plain-text Markdown editor and the rendered preview (MarkdownContent).
 */
"use client";

import { useState } from "react";
import { Check, Copy, Eye, Pencil } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { VisionConversionResponse } from "../../types";

export function VisionConverterResult({ result }: { result: VisionConversionResponse }) {
  const [markdown, setMarkdown] = useState(result.markdown_output);
  const [lastOutput, setLastOutput] = useState(result.markdown_output);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (lastOutput !== result.markdown_output) {
    setLastOutput(result.markdown_output);
    setMarkdown(result.markdown_output);
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy markdown:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Converted Markdown</CardTitle>
        <CardAction className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
            <Switch
              size="sm"
              checked={isEditing}
              onCheckedChange={setIsEditing}
              aria-label="Toggle between editor and preview"
            />
            <span>Edit</span>
            <Pencil className="h-4 w-4" />
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            className="min-h-[24rem] font-mono text-sm"
            aria-label="Markdown source"
          />
        ) : (
          <MarkdownContent content={markdown} />
        )}
      </CardContent>
    </Card>
  );
}
