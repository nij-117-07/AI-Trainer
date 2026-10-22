// src/components/ui/code-block.tsx
"use client";

/**
 * Syntax-highlighted Code Block with Copy-to-Clipboard.
 * Uses react-syntax-highlighter with PrismLight for optimal bundle size.
 * Includes visual feedback during copy operations and supports filename headers.
 */

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/cjs/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/cjs/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/cjs/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import css from "react-syntax-highlighter/dist/cjs/languages/prism/css";
import python from "react-syntax-highlighter/dist/cjs/languages/prism/python";
import bash from "react-syntax-highlighter/dist/cjs/languages/prism/bash";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Register commonly used languages to keep bundle size minimal
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);

interface CodeBlockProps {
  /** Raw code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Optional filename to display in header */
  filename?: string;
  /** Additional Tailwind classes */
  className?: string;
}

export function CodeBlock({
  code,
  language = "text",
  filename,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useState(false);

  const handleCopy = async () => {
    startTransition(true);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    } finally {
      startTransition(false);
    }
  };

  return (
    <div className={cn(
      "relative group rounded-lg bg-[#1e1e1e] border border-border overflow-hidden",
      className
    )}>
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-[#252526]">
          <span className="text-xs text-zinc-400 font-mono">{filename}</span>
          <span className="text-xs text-zinc-500 uppercase">{language}</span>
        </div>
      )}
      
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          className="absolute right-3 top-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm disabled:opacity-50"
          onClick={handleCopy}
          aria-label={copied ? "Copied to clipboard" : "Copy code"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-zinc-400" />
          )}
        </Button>
        
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            background: "transparent",
            fontSize: "0.875rem",
            lineHeight: "1.7142857",
            borderRadius: filename ? "0 0 0.5rem 0.5rem" : "0.5rem",
          }}
          codeTagProps={{
            className: "font-mono",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}