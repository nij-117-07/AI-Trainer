// src/features/learning/explainer/components/pages/OrchestrateToolPage.tsx
/**
 * Orchestrated Journey tool page. Streams chapters live via the same-origin
 * SSE proxy. The stream state (plan + chapters) is persisted to localStorage,
 * and the form inputs are persisted separately like the other tools.
 */
"use client";

import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { OrchestratorRequestSchema } from "../../types";
import { usePersistedForm } from "../../hooks/usePersistedForm";
import { useOrchestrateStream } from "../../hooks/useOrchestrateStream";
import { ExplainerPageShell } from "../ExplainerPageShell";
import { DraftStatus } from "../DraftStatus";
import { InputField } from "../fields";
import { OrchestrateResult } from "../results/OrchestrateResult";

type OrchestrateFormValues = z.infer<typeof OrchestratorRequestSchema>;

const FORM_STORAGE_KEY = "learning.explainer.orchestrate.form.v1";
const STREAM_STORAGE_KEY = "learning.explainer.orchestrate.stream.v1";

const DEFAULTS: OrchestrateFormValues = {
  topic: "Calculus",
  expertise: "Undergraduate",
};

export function OrchestrateToolPage() {
  const persisted = usePersistedForm<OrchestrateFormValues, unknown>({
    schema: OrchestratorRequestSchema,
    storageKey: FORM_STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const stream = useOrchestrateStream(STREAM_STORAGE_KEY);

  const errors = persisted.form.formState.errors;

  const handleStart = persisted.form.handleSubmit((values) => {
    stream.start(values);
  });

  return (
    <ExplainerPageShell
      title="Orchestrated Journey"
      description="Stream a comprehensive A-to-Z journey: a chapter plan arrives first, then each chapter deep-dive streams in live."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={persisted.resetDraft}
          onClear={persisted.clearDraft}
          disabled={stream.status === "streaming"}
        />
      }
      form={
        <form onSubmit={handleStart} className="space-y-4">
          <InputField
            label="Topic"
            htmlFor="topic"
            placeholder="e.g. Calculus"
            disabled={stream.status === "streaming"}
            {...persisted.form.register("topic")}
            error={errors.topic?.message}
          />
          <InputField
            label="Expertise / Depth"
            htmlFor="expertise"
            placeholder="e.g. Undergraduate, PhD, Hobbyist"
            disabled={stream.status === "streaming"}
            {...persisted.form.register("expertise")}
            error={errors.expertise?.message}
          />
          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              disabled={stream.status === "streaming"}
              className="w-full gap-2"
            >
              {stream.status === "streaming" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Streaming…
                </>
              ) : (
                "Start Journey"
              )}
            </Button>
          </div>
        </form>
      }
      result={
        <OrchestrateResult
          status={stream.status}
          titles={stream.titles}
          prerequisites={stream.prerequisites}
          chapters={stream.chapters}
          error={stream.error}
          onStop={stream.stop}
          onReset={stream.reset}
        />
      }
    />
  );
}
