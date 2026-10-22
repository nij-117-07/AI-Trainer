// src/features/tools/diagram/components/results/DiagramResult.tsx
/**
 * Renders the Diagram Generator output: the explanation message, a live
 * Mermaid preview (pan/zoom/download) or a full Draw.io embed editor, and the
 * diagram code in a copyable code block.
 */
"use client";

import { Play, RotateCcw } from "lucide-react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { MermaidPreview } from "./MermaidPreview";
import { DrawioEditor } from "./DrawioEditor";
import type { DiagramResponse } from "../../types";

interface DiagramResultProps {
  result: DiagramResponse;
  /** The code to display/render (generated output or custom/restored existing code). */
  previewCode: string;
  /** True when the active format tab is Mermaid. */
  isMermaid: boolean;
  /** Mermaid only: re-renders the current Existing Code value into the preview. */
  onRender: () => void;
  /** Draw.io only: apply an edited diagram back into the app state. */
  onDrawioSave: (xml: string) => void;
  /** Draw.io only: remount the editor with the last saved diagram XML. */
  onDrawioReload: () => void;
  /** Draw.io only: bumped to force the embed iframe to reload its diagram. */
  editorVersion: number;
}

export function DiagramResult({
  result,
  previewCode,
  isMermaid,
  onRender,
  onDrawioSave,
  onDrawioReload,
  editorVersion,
}: DiagramResultProps) {
  const filename = result.format === "mermaid" ? "diagram.mmd" : "diagram.drawio.xml";

  return (
    <div className="space-y-4">
      {result.message.trim() && (
        <Card>
          <CardContent className="p-5">
            <MarkdownContent content={result.message} />
          </CardContent>
        </Card>
      )}

      {isMermaid ? (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardAction className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onRender} disabled={!previewCode.trim()}>
                <Play className="h-4 w-4" />
                Render
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-5">
            <MermaidPreview code={previewCode} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Draw.io editor</CardTitle>
            <CardAction className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onDrawioReload} disabled={!previewCode.trim()}>
                <RotateCcw className="h-4 w-4" />
                Reload from saved code
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="p-4">
            <DrawioEditor
              key={editorVersion}
              xml={previewCode}
              onSave={onDrawioSave}
              onClose={() => {}}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Diagram code</h3>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {result.format}
            </span>
          </div>
          <CodeBlock code={isMermaid ? result.code : previewCode || result.code} language="text" filename={filename} />
        </CardContent>
      </Card>
    </div>
  );
}
