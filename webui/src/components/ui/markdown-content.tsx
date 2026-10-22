// src/components/ui/markdown-content.tsx
/**
 * Enhanced Markdown Content Renderer with Full GFM & Math Support.
 * Renders GitHub-flavored Markdown (tables, task lists, strikethrough) and
 * LaTeX mathematical formulas ($inline$ and $$block$$) using KaTeX.
 * Features responsive tables, accessible code blocks, and semantic typography.
 * 
 * FIX: Uses <div> for paragraphs to prevent invalid nesting of block elements (tables, divs)
 * inside <p> tags, which causes React hydration errors.
 */

"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import { Components } from "react-markdown";

interface MarkdownContentProps {
  /** Raw Markdown content string */
  content: string;
  /** Additional Tailwind classes for container */
  className?: string;
  /** Color scheme variant for specialized contexts */
  variant?: "default" | "amber" | "slate";
  /** Enable LaTeX math rendering */
  enableMath?: boolean;
}

const variantStyles = {
  default: "prose-slate dark:prose-invert",
  amber: "prose-amber prose-headings:text-amber-900 prose-p:text-amber-900 prose-strong:text-amber-950 prose-code:text-amber-800 prose-code:bg-amber-100 dark:prose-invert dark:prose-headings:text-amber-100 dark:prose-p:text-amber-100/90 dark:prose-strong:text-amber-50 dark:prose-code:text-amber-200 dark:prose-code:bg-amber-900/30",
  slate: "prose-slate prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 dark:prose-invert"
};

export function MarkdownContent({
  content,
  className,
  variant = "default",
  enableMath = true,
}: MarkdownContentProps) {
  const components: Components = {
    // Syntax-highlighted code blocks vs inline code
    code: ({ node, className: codeClassName, children, ...props }) => {
      const match = /language-(\w+)/.exec(codeClassName || "");
      const language = match ? match[1] : "text";
      const code = String(children).replace(/\n$/, "");
      const isInline = !match;

      if (isInline) {
        return (
          <code
            className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <CodeBlock
          code={code}
          language={language}
          className="my-6"
        />
      );
    },
    // Responsive table wrapper with overflow handling
    table: ({ children }) => (
      <div className="my-6 w-full overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full border-collapse text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-muted/50 border-b border-border">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="border-b border-border px-4 py-3 text-left font-semibold text-foreground bg-muted/30">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-border px-4 py-3 text-foreground/80 align-top">
        {children}
      </td>
    ),
    tr: ({ children }) => (
      <tr className="transition-colors hover:bg-muted/30 last:border-b-0">
        {children}
      </tr>
    ),
    // Semantic headings with scroll margins for anchor links
    h1: ({ children }) => (
      <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl mb-4 mt-8 first:mt-0 text-foreground">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 mt-10 mb-4 text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-3 text-foreground">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-2 text-foreground">
        {children}
      </h4>
    ),
    // Lists with proper spacing and markers
    ul: ({ children }) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2 marker:text-muted-foreground">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 marker:text-muted-foreground">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    // Task lists (GFM)
    input: ({ checked }) => (
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="mr-2 h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
    ),
    // Blockquotes with accent border
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-4 border-primary/30 bg-muted/30 pl-4 py-2 pr-4 italic text-muted-foreground rounded-r-lg">
        {children}
      </blockquote>
    ),
    // Horizontal rule
    hr: () => <hr className="my-8 border-border" />,
    // External links with security attributes
    a: ({ href, children }) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors break-words"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    // Paragraphs with adequate leading - CHANGED TO DIV to prevent invalid nesting
    // This allows block elements (like tables wrapped in divs) to be nested without hydration errors
    p: ({ children }) => (
      <div className="leading-7 [&:not(:first-child)]:mt-6 text-foreground/90 break-words">
        {children}
      </div>
    ),
    // Bold and italic with proper color contrast
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-foreground/90">
        {children}
      </em>
    ),
    // Strikethrough (GFM)
    del: ({ children }) => (
      <del className="line-through text-muted-foreground">
        {children}
      </del>
    ),
  };

  return (
    <article className={cn(
      "prose prose-sm md:prose-base lg:prose-lg max-w-none",
      "prose-headings:scroll-m-20 prose-headings:tracking-tight",
      "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
      "prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none",
      "prose-pre:bg-transparent prose-pre:p-0",
      variantStyles[variant],
      className
    )}>
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          ...(enableMath ? [remarkMath] : [])
        ]}
        rehypePlugins={enableMath ? [rehypeKatex] : []}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}