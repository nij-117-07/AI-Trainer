// src/features/learning/roadmap/components/AddPointForm.tsx
/**
 * Inline input + add button for manually adding main points and subpoints.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddPointFormProps {
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (title: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function AddPointForm({
  placeholder = "Add an item…",
  submitLabel = "Add",
  onSubmit,
  disabled,
  autoFocus,
}: AddPointFormProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const title = value.trim();
    if (!title) return;
    onSubmit(title);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="bg-transparent"
      />
      <Button type="submit" variant="secondary" disabled={disabled || !value.trim()}>
        <Plus className="h-4 w-4" />
        {submitLabel}
      </Button>
    </form>
  );
}
