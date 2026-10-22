// src/features/practice/interview/components/session/DirectiveStage.tsx
/**
 * Stage ① — Session manager output: the chosen next action plus its directive.
 * Gate: Proceed (send directive to the generator), Edit directive (inline
 * override), or Re-decide (ask the backend to pick again).
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, RotateCcw, StepForward } from "lucide-react";
import { StageShell, StageBadge } from "./StageShell";
import { useSyncedDraft } from "../../hooks/useSyncedDraft";
import { difficultyOptions, questionTypeOptions } from "../../lib/options";
import type { Directive, SessionDecideResponse } from "../../types";

interface DirectiveStageProps {
  decision: SessionDecideResponse;
  isPending: boolean;
  error: string | null;
  onProceed: () => void;
  onEdit: (directive: Directive) => void;
  onRedecide: () => void;
}

export function DirectiveStage({
  decision,
  isPending,
  error,
  onProceed,
  onEdit,
  onRedecide,
}: DirectiveStageProps) {
  const [editing, setEditing] = useState(false);
  const directive = decision.directive;

  const [draft, setDraft] = useSyncedDraft(directive);

  const set = (patch: Partial<Directive>) => setDraft((prev) => ({ ...prev, ...patch }));

  const handleSave = () => {
    onEdit(draft);
    setEditing(false);
  };

  return (
    <StageShell
      step="Step 1"
      label="Session manager decision"
      hint={decision.action_reasoning || "The session manager picked the next move."}
      isPending={isPending}
      pendingLabel="Deciding the next move…"
      error={error}
      actions={
        editing ? (
          <>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending} className="gap-1.5">
              Save edits
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={onRedecide} disabled={isPending} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              Re-decide
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(true)} disabled={isPending} className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Edit directive
            </Button>
            <Button type="button" onClick={onProceed} disabled={isPending} className="gap-1.5">
              <StepForward className="h-4 w-4" />
              Proceed
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-wrap gap-2">
        <StageBadge className="border-primary/30 bg-primary/10 text-primary">
          {decision.next_action}
        </StageBadge>
        {draft.topic ? <StageBadge>topic: {draft.topic}</StageBadge> : null}
        {draft.difficulty ? <StageBadge>difficulty: {draft.difficulty}</StageBadge> : null}
        {draft.question_type ? <StageBadge>type: {draft.question_type}</StageBadge> : null}
      </div>

      {editing ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="directive_topic">Topic</Label>
            <Input
              id="directive_topic"
              className="bg-transparent"
              value={draft.topic ?? ""}
              onChange={(event) => set({ topic: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="directive_type">Question type</Label>
            <Select value={draft.question_type ?? "technical"} onValueChange={(value) => set({ question_type: value })}>
              <SelectTrigger id="directive_type" className="w-full bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="directive_difficulty">Difficulty</Label>
            <Select value={draft.difficulty ?? "medium"} onValueChange={(value) => set({ difficulty: value })}>
              <SelectTrigger id="directive_difficulty" className="w-full bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficultyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="directive_focus">Focus area</Label>
            <Input
              id="directive_focus"
              className="bg-transparent"
              value={draft.focus_area ?? ""}
              onChange={(event) => set({ focus_area: event.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="directive_constraints">Constraints</Label>
            <Textarea
              id="directive_constraints"
              className="min-h-16 resize-none bg-transparent"
              value={draft.constraints ?? ""}
              onChange={(event) => set({ constraints: event.target.value })}
            />
          </div>
        </div>
      ) : (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            ["Focus area", draft.focus_area],
            ["Tone guidance", draft.tone_guidance],
            ["Constraints", draft.constraints],
          ].map(([label, value]) =>
            value ? (
              <div key={label} className="space-y-0.5">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                <dd className="text-foreground/90">{value}</dd>
              </div>
            ) : null
          )}
        </dl>
      )}
    </StageShell>
  );
}
