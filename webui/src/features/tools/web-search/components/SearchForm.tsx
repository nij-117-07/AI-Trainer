// src/features/tools/web-search/components/SearchForm.tsx
/**
 * Search form for the Web Search tool. The query row validates with the
 * Search Zod schema; a collapsible "Advanced filters" panel exposes region,
 * time range, and safe search. Hands values to the search submit handler.
 */
"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import {
  SearchFormSchema,
  ENGINE_OPTIONS,
  SEARCH_REGIONS,
  SAFE_SEARCH_LEVELS,
  TIME_RANGES,
  hasAdvancedFilters,
  type SearchFormValues,
} from "../types";

interface SearchFormProps {
  defaultQuery?: string;
  isPending: boolean;
  error: string | null;
  onSubmit: (values: SearchFormValues) => void;
}

function EngineField({ control, isPending }: { control: Control<SearchFormValues>; isPending: boolean }) {
  return (
    <Controller
      control={control}
      name="engine"
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
          <SelectTrigger className="w-full shrink-0 sm:w-48" aria-label="Search engine">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENGINE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

function ResultCountField({ control, isPending }: { control: Control<SearchFormValues>; isPending: boolean }) {
  return (
    <Controller
      control={control}
      name="result_count"
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
          <SelectTrigger className="w-28 shrink-0" aria-label="Number of results">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 results</SelectItem>
            <SelectItem value="10">10 results</SelectItem>
            <SelectItem value="20">20 results</SelectItem>
          </SelectContent>
        </Select>
      )}
    />
  );
}

function QueryField({
  register,
  errors,
  isPending,
}: {
  register: UseFormRegister<SearchFormValues>;
  errors: FieldErrors<SearchFormValues>;
  isPending: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <Input
        placeholder="Search the web…"
        autoComplete="off"
        disabled={isPending}
        aria-invalid={Boolean(errors.query)}
        {...register("query")}
      />
      {errors.query && (
        <p className="text-xs text-destructive">{errors.query.message}</p>
      )}
    </div>
  );
}

interface FilterSelectFieldProps {
  control: Control<SearchFormValues>;
  name: "region" | "time_range" | "safe_search";
  label: string;
  options: readonly { readonly value: string; readonly label: string }[];
  isPending: boolean;
}

function FilterSelectField({ control, name, label, options, isPending }: FilterSelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
            <SelectTrigger className="w-full sm:w-44" aria-label={label}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(
                (option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  );
}

export function SearchForm({ defaultQuery, isPending, error, onSubmit }: SearchFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(SearchFormSchema),
    defaultValues: {
      query: defaultQuery ?? "",
      engine: "duckduckgo",
      result_count: "10",
      region: "wt-wt",
      time_range: "any",
      safe_search: "-1",
    },
  });

  const formValues = useWatch({ control });
  const filtersActive = hasAdvancedFilters({
    query: formValues.query ?? "",
    engine: formValues.engine ?? "duckduckgo",
    result_count: formValues.result_count ?? "10",
    region: formValues.region ?? "wt-wt",
    time_range: formValues.time_range ?? "any",
    safe_search: formValues.safe_search ?? "-1",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" aria-busy={isPending}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <QueryField register={register} errors={errors} isPending={isPending} />
        <EngineField control={control} isPending={isPending} />
        <ResultCountField control={control} isPending={isPending} />
        <Button type="submit" disabled={isPending} className="shrink-0 gap-2">
          {isPending ? "Searching…" : "Search"}
        </Button>
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-xs text-muted-foreground"
          >
            <ChevronDown className="h-4 w-4" />
            Advanced filters
            {filtersActive && (
              <Badge variant="secondary" className="text-[10px]">
                active
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-3">
            <FilterSelectField
              control={control}
              name="region"
              label="Region"
              options={SEARCH_REGIONS}
              isPending={isPending}
            />
            <FilterSelectField
              control={control}
              name="time_range"
              label="Time range"
              options={TIME_RANGES}
              isPending={isPending}
            />
            <FilterSelectField
              control={control}
              name="safe_search"
              label="Safe search"
              options={SAFE_SEARCH_LEVELS}
              isPending={isPending}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Filters apply to the whole search, including pages loaded with “Load more”.
          </p>
        </CollapsibleContent>
      </Collapsible>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <span>{error}</span>
        </div>
      )}
    </form>
  );
}
