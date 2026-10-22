// src/features/learning/explainer/hooks/usePersistedForm.ts
/**
 * The "better implementation" for prefilled, refresh-safe forms.
 *
 * Combines react-hook-form with localStorage persistence:
 *  - Ships curated DEFAULT values (prefill) and restores the last draft on mount
 *    (hydration-safe: restore happens after mount, so no SSR mismatch).
 *  - The persisted draft is validated with the form's Zod schema before being
 *    applied, so corrupt/partial drafts fall back to defaults.
 *  - Form inputs are debounced-written on every keystroke.
 *  - The last RESULT is stored in the same key (once per generation) so a
 *    refresh restores both your inputs and the previous output.
 *  - Exposes resetDraft() (back to defaults) and clearDraft() (wipe storage).
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import type { PersistStatus } from "./usePersistedState";

interface UsePersistedFormOptions<TForm extends FieldValues> {
  /** Zod schema used for validation AND draft hydration. */
  schema: z.ZodType<TForm>;
  /** Versioned localStorage key, e.g. "learning.explainer.explain.v1". */
  storageKey: string;
  /** Curated default form values used as prefill / fallback. */
  defaults: TForm;
}

interface PersistedDraft<TForm, TResult> {
  form: TForm;
  result: TResult | null;
  savedAt?: string;
}

export interface UsePersistedFormResult<TForm extends FieldValues, TResult> {
  /** react-hook-form instance (pass to <form {...form}> or fields). */
  form: UseFormReturn<TForm>;
  /** "idle" before hydration, "saving"/"saved" while persisting. */
  status: PersistStatus;
  /** Last generated result, restored from localStorage. */
  result: TResult | null;
  /** Persist a freshly generated result immediately. */
  setResult: (result: TResult | null) => void;
  /** Reset form + result to the curated defaults. */
  resetDraft: () => void;
  /** Wipe localStorage and reset to defaults. */
  clearDraft: () => void;
}

export function usePersistedForm<TForm extends FieldValues, TResult>({
  schema,
  storageKey,
  defaults,
}: UsePersistedFormOptions<TForm>): UsePersistedFormResult<TForm, TResult> {
  // Cast is contained: TForm is always `z.infer<typeof schema>` at call sites,
  // and the concrete schema is validated/hydrated separately below.
  const resolver = zodResolver(schema) as unknown as Resolver<TForm>;
  const form = useForm<TForm, unknown, TForm>({
    resolver,
    defaultValues: defaults as DefaultValues<TForm>,
  });

  const [status, setStatus] = useState<PersistStatus>("idle");
  const [result, setResultState] = useState<TResult | null>(null);

  const hydrated = useRef(false);
  const resultRef = useRef<TResult | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistNow = useCallback(
    (values: TForm, resultValue: TResult | null) => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        try {
          const draft: PersistedDraft<TForm, TResult> = {
            form: values,
            result: resultValue,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(storageKey, JSON.stringify(draft));
          setStatus("saved");
        } catch (error) {
          console.error(`[usePersistedForm] Failed to persist "${storageKey}":`, error);
          setStatus("saved");
        }
      }, 300);
    },
    [storageKey]
  );

  // 1. Hydrate the form + result from localStorage after mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const draftSchema = z.object({
          form: schema,
          result: z.unknown().nullable(),
          savedAt: z.string().optional(),
        });
        const parsed = draftSchema.safeParse(JSON.parse(raw));
        if (parsed.success) {
          form.reset(parsed.data.form);
          resultRef.current = (parsed.data.result as TResult | null) ?? null;
          setResultState(resultRef.current);
        }
      }
    } catch (error) {
      console.error(`[usePersistedForm] Failed to hydrate "${storageKey}":`, error);
    } finally {
      hydrated.current = true;
    }
  }, [storageKey, schema, form]);

  // 2. Persist form values on every change (debounced), once hydrated.
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!hydrated.current) return;
      setStatus("saving");
      persistNow(values as TForm, resultRef.current);
    });
    return () => {
      subscription.unsubscribe();
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [form, persistNow]);

  const setResult = useCallback(
    (next: TResult | null) => {
      resultRef.current = next;
      setResultState(next);
      persistNow(form.getValues(), next);
    },
    [form, persistNow]
  );

  const resetDraft = useCallback(() => {
    form.reset(defaults);
    resultRef.current = null;
    setResultState(null);
    persistNow(defaults, null);
  }, [form, defaults, persistNow]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore storage errors
    }
    form.reset(defaults);
    resultRef.current = null;
    setResultState(null);
  }, [storageKey, form, defaults]);

  return { form, status, result, setResult, resetDraft, clearDraft };
}
