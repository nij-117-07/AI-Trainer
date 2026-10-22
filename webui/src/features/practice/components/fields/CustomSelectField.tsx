// src/features/practice/components/fields/CustomSelectField.tsx
/**
 * Shared practice-domain select field that ships an extra "Other / Custom"
 * option. Picking it reveals a text input so users can submit arbitrary
 * values for question type / difficulty / expected level (the backends accept
 * any string). Kept atomic so feature forms stay clean.
 */
"use client";

import { useState } from "react";
import {
  Controller,
  useWatch,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldOption } from "@/features/learning/explainer/components/fields";

const CUSTOM_VALUE = "__custom__";

interface CustomSelectFieldProps<TFieldValues extends FieldValues> {
  label: string;
  name: Path<TFieldValues>;
  htmlFor: string;
  control: Control<TFieldValues>;
  options: FieldOption[];
  error?: string;
  hint?: string;
  disabled?: boolean;
  placeholder?: string;
  customLabel?: string;
  customPlaceholder?: string;
}

export function CustomSelectField<TFieldValues extends FieldValues>({
  label,
  name,
  htmlFor,
  control,
  options,
  error,
  hint,
  disabled,
  placeholder = "Select an option",
  customLabel = "Other / Custom",
  customPlaceholder = "Enter a custom value",
}: CustomSelectFieldProps<TFieldValues>) {
  const [pickedCustom, setPickedCustom] = useState(false);
  const watchedValue = useWatch({ control, name });

  if (
    pickedCustom &&
    watchedValue !== "" &&
    options.some((option) => option.value === watchedValue)
  ) {
    setPickedCustom(false);
  }

  const isPresetValue = (value: string) =>
    value !== "" && options.some((option) => option.value === value);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          const isCustom = pickedCustom || (field.value !== "" && !isPresetValue(field.value));
          return (
            <div className="space-y-2">
              <Select
                value={isCustom ? CUSTOM_VALUE : field.value}
                onValueChange={(value) => {
                  if (value === CUSTOM_VALUE) {
                    setPickedCustom(true);
                    field.onChange("");
                  } else {
                    setPickedCustom(false);
                    field.onChange(value);
                  }
                }}
                disabled={disabled}
              >
                <SelectTrigger id={htmlFor} className="w-full" aria-invalid={!!error}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_VALUE}>{customLabel}</SelectItem>
                </SelectContent>
              </Select>
              {isCustom && (
                <Input
                  className="bg-transparent"
                  placeholder={customPlaceholder}
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  disabled={disabled}
                />
              )}
              {error ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : hint ? (
                <p className="text-xs text-muted-foreground">{hint}</p>
              ) : null}
            </div>
          );
        }}
      />
    </div>
  );
}
