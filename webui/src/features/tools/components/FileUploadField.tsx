// src/features/tools/components/FileUploadField.tsx
/**
 * Reusable image/file picker for the upload-based tools (Vision Converter,
 * Ingredients). Shows the chosen filename with a clear button and keeps the
 * native input visually hidden but accessible.
 */
"use client";

import { useRef } from "react";
import { ImageUp, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadFieldProps {
  label: string;
  htmlFor: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileUploadField({
  label,
  htmlFor,
  value,
  onChange,
  accept = "image/*",
  error,
  hint,
  disabled,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>

      <input
        ref={inputRef}
        id={htmlFor}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          onChange(file);
          event.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <ImageUp className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm">{value.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove selected file"
            disabled={disabled}
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-6 text-sm text-muted-foreground transition-colors",
            "hover:border-primary/50 hover:text-foreground",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <ImageUp className="h-4 w-4" />
          Choose an image…
        </button>
      )}

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
