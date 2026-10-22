// src/features/learning/tutor/components/fields/SystemPromptSelector.tsx
/**
 * Dropdown of saved system prompt templates. Picking one fills the system
 * prompt textarea with that template's content (still editable afterwards).
 */
"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PromptResponse } from "../../types";

interface SystemPromptSelectorProps {
  prompts: PromptResponse[] | null;
  isLoading: boolean;
  disabled?: boolean;
  error?: string | null;
  onApply: (content: string) => void;
}

export function SystemPromptSelector({
  prompts,
  isLoading,
  disabled,
  error,
  onApply,
}: SystemPromptSelectorProps) {
  const [selected, setSelected] = useState("");

  const handleSelect = (name: string) => {
    setSelected(name);
    const template = prompts?.find((prompt) => prompt.name === name);
    if (template) onApply(template.content);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="prompt_template" className="text-sm font-medium">
        System Prompt Template
      </Label>
      <Select value={selected} onValueChange={handleSelect} disabled={disabled || isLoading}>
        <SelectTrigger id="prompt_template" className="w-full">
          <SelectValue
            placeholder={isLoading ? "Loading templates…" : "Choose a template to autofill"}
          />
        </SelectTrigger>
        <SelectContent>
          {prompts?.map((prompt) => (
            <SelectItem key={prompt.name} value={prompt.name}>
              {prompt.name}
            </SelectItem>
          ))}
          {prompts && prompts.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No templates saved yet.
            </div>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
