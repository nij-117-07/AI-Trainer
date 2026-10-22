// src/features/practice/joke-coach/components/modes/CrowdMode.tsx
/**
 * Crowd simulation mode: predict how an audience will react to a joke.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField, TextareaField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { simulateCrowdAction } from "../../actions";
import {
  CrowdSimulationFormSchema,
  type CrowdSimulationFormValues,
  type CrowdSimulationResponse,
} from "../../types";
import { venueTypeOptions } from "../../lib/options";
import { ModeLayout } from "../ModeLayout";

const STORAGE_KEY = "practice.joke-coach.crowd.v1";

const DEFAULTS: CrowdSimulationFormValues = {
  joke: "Why do programmers prefer dark mode? Because light attracts bugs.",
  venue_type: "open-mic",
  audience_demographic: "mixed tech crowd, late 20s to 40s",
};

export function CrowdMode() {
  const persisted = usePersistedForm<CrowdSimulationFormValues, CrowdSimulationResponse>({
    schema: CrowdSimulationFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const tool = useToolRequest<CrowdSimulationFormValues, CrowdSimulationResponse>({
    run: simulateCrowdAction,
    onSuccess: persisted.setResult,
  });

  const errors = persisted.form.formState.errors;
  const result = tool.data ?? persisted.result;

  const probability = result ? Math.round(result.laugh_probability * 100) : 0;

  return (
    <ModeLayout
      status={persisted.status}
      onReset={persisted.resetDraft}
      onClear={persisted.clearDraft}
      disabled={tool.isPending}
      form={
        <form onSubmit={persisted.form.handleSubmit(tool.execute)} className="space-y-4">
          <TextareaField
            label="The Joke"
            htmlFor="crowd_joke"
            placeholder="Paste the joke you're planning to tell."
            disabled={tool.isPending}
            {...persisted.form.register("joke")}
            error={errors.joke?.message}
          />
          <SelectField
            label="Venue Type"
            name="venue_type"
            htmlFor="crowd_venue"
            control={persisted.form.control}
            options={venueTypeOptions}
            disabled={tool.isPending}
            error={errors.venue_type?.message}
          />
          <InputField
            label="Audience Demographic"
            htmlFor="crowd_demographic"
            placeholder="Describe the expected audience."
            disabled={tool.isPending}
            {...persisted.form.register("audience_demographic")}
            error={errors.audience_demographic?.message}
          />
          <FormActions
            isPending={tool.isPending}
            error={tool.error}
            submitLabel="Simulate the crowd"
            submitPendingLabel="Predicting the reaction…"
          />
        </form>
      }
      result={
        result ? (
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Predicted response</p>
                  <p className="text-xl font-semibold capitalize">{result.predicted_response}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tabular-nums">{probability}%</p>
                  <p className="text-xs text-muted-foreground">laugh probability</p>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${probability}%` }}
                />
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">Best delivery style</p>
                <p className="text-sm font-medium">{result.best_delivery_style}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Potential risks</p>
                <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                  {result.potential_risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              {result.alternative_punchline && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Backup punchline</p>
                  <p className="mt-1 text-sm">{result.alternative_punchline}</p>
                </div>
              )}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                {result.crowd_work_opportunity}
              </div>
              <Badge variant="outline" className="w-fit capitalize">
                venue: {persisted.form.getValues("venue_type")}
              </Badge>
            </CardContent>
          </Card>
        ) : (
          <EmptyResult
            icon={Users}
            title="No simulation yet"
            description="Paste your joke and pick a venue to predict the reaction."
          />
        )
      }
    />
  );
}
