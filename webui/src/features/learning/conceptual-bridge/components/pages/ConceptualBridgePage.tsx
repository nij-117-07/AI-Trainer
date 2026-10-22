// src/features/learning/conceptual-bridge/components/pages/ConceptualBridgePage.tsx
/**
 * Conceptual Bridge Builder page: connect two unrelated concepts through a
 * deep structural analogy.
 */
"use client";

import { Link2 } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generateBridgeAction } from "../../actions/generate";
import { BridgeFormSchema, type BridgeFormValues, type BridgeResponse } from "../../types";
import { abstractionDepthOptions } from "../../lib/options";
import { ConceptualBridgeResult } from "../results/ConceptualBridgeResult";

const STORAGE_KEY = "learning.conceptual-bridge.v1";

const DEFAULTS: BridgeFormValues = {
  concept_a: "Photosynthesis",
  concept_b: "Blockchain",
  abstraction_depth: "structural",
};

export function ConceptualBridgePage() {
  const persisted = usePersistedForm<BridgeFormValues, BridgeResponse>({
    schema: BridgeFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<BridgeFormValues, BridgeResponse>({
    run: generateBridgeAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  return (
    <ExplainerPageShell
      title="Conceptual Bridge Builder"
      description="Give two seemingly unrelated concepts and the builder will reveal the deep structural analogy between them."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={persisted.resetDraft}
          onClear={persisted.clearDraft}
          disabled={tool.isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
          <InputField
            label="Concept A"
            htmlFor="bridge_concept_a"
            placeholder="e.g. Photosynthesis"
            disabled={tool.isPending}
            {...persisted.form.register("concept_a")}
            error={errors.concept_a?.message}
          />
          <InputField
            label="Concept B"
            htmlFor="bridge_concept_b"
            placeholder="e.g. Blockchain"
            disabled={tool.isPending}
            {...persisted.form.register("concept_b")}
            error={errors.concept_b?.message}
          />
          <SelectField
            label="Abstraction Depth"
            name="abstraction_depth"
            htmlFor="bridge_depth"
            control={persisted.form.control}
            options={abstractionDepthOptions}
            disabled={tool.isPending}
            error={errors.abstraction_depth?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Build the bridge"
            submitPendingLabel="Connecting concepts…"
          />
        </form>
      }
      result={
        result ? (
          <ConceptualBridgeResult result={result} />
        ) : (
          <EmptyResult
            icon={Link2}
            title="No bridge yet"
            description="Enter two concepts and the builder will draw the analogy between them."
          />
        )
      }
    />
  );
}
