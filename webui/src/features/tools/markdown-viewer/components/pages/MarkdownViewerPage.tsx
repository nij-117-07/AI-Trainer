"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Copy, Download, FileText, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { toast } from "sonner";

const STORAGE_KEY = "tools.markdown-viewer.content.v1";

const SAMPLE = `# Markdown Viewer

Type or paste **Markdown** on the left and see the rendered result on the right.

## Features

- Live preview as you type
- GitHub-flavored Markdown (tables, task lists, strikethrough)
- Math support with \`$inline$\` and \`$$block$$\`
- Code blocks with syntax highlighting

| Column A | Column B |
|----------|----------|
| Row 1    | Value 1  |
| Row 2    | Value 2  |

- [x] Done
- [ ] Todo

\`\`\`ts
const greeting = "Hello, Markdown!";
console.log(greeting);
\`\`\`
`;

function countWords(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function MarkdownViewerPage() {
  const [content, setContent] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      setContent(saved !== null ? saved : SAMPLE);
    } catch {
      setContent(SAMPLE);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, content);
    } catch {
      // ignore storage errors
    }
  }, [content, hydrated]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Markdown copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "document.md";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Downloaded document.md");
    } catch {
      toast.error("Could not download file");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setContent(text);
      toast.success(`Loaded ${file.name}`);
    } catch {
      toast.error("Could not read file");
    } finally {
      event.target.value = "";
    }
  };

  const handleReset = () => {
    setContent(SAMPLE);
    toast.success("Reset to sample");
  };

  const handleClear = () => {
    setContent("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Markdown Viewer</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Edit Markdown on the left and instantly preview the rendered output on the right.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleUploadClick}>
            <Upload className="size-4" />
            Open file
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="size-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="size-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4" />
              Editor
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {content.length} chars · {countWords(content)} words · {content.split("\n").length} lines
            </span>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write your Markdown here…"
              className="min-h-[60vh] resize-y font-mono text-sm leading-relaxed"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-4" />
              Preview
            </CardTitle>
            <span className="text-xs text-muted-foreground">Live render</span>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="max-h-[60vh] overflow-auto rounded-lg border border-border/60 bg-background p-4">
              {content.trim() ? (
                <MarkdownContent content={content} />
              ) : (
                <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}