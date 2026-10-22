// src/features/learning/tutor-chat/components/chat/SettingsPanel.tsx
/**
 * Left-hand settings column for a live session: the master topic and
 * additional context are editable and autosaved to the server (debounced) so
 * the next turn uses the latest values. Also hosts back-to-list and new
 * session actions.
 */
"use client";

import { Check, Eraser, Loader2, ListRestart, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/features/learning/explainer/components/fields";
import type { SettingsStatus, TutorSettings } from "../../hooks/useTutorChat";

interface SettingsPanelProps {
  settings: TutorSettings;
  onUpdate: (patch: Partial<TutorSettings>) => void;
  status: SettingsStatus;
  error: string | null;
  disabled?: boolean;
  onBackToList: () => void;
  onNewSession: () => void;
}

export function SettingsPanel({
  settings,
  onUpdate,
  status,
  error,
  disabled,
  onBackToList,
  onNewSession,
}: SettingsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={onBackToList}
          disabled={disabled}
        >
          <ListRestart className="h-3.5 w-3.5" />
          All Sessions
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={onNewSession}
          disabled={disabled}
        >
          <Eraser className="h-3.5 w-3.5" />
          New Session
        </Button>
      </div>

      <InputField
        label="Master Topic"
        htmlFor="master_topic"
        placeholder="e.g. Quantum Physics"
        value={settings.master_topic}
        onChange={(event) => onUpdate({ master_topic: event.target.value })}
        disabled={disabled}
      />
      <TextareaField
        label="Your Background & Context"
        htmlFor="additional_context"
        placeholder="Optional — background, goals, or learning style…"
        hint="Saved with your session and included with every turn."
        value={settings.additional_context}
        onChange={(event) => onUpdate({ additional_context: event.target.value })}
        disabled={disabled}
      />

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {status === "saving" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Saving…</span>
          </>
        ) : status === "saved" ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span>Saved</span>
          </>
        ) : status === "error" ? (
          <>
            <Save className="h-3.5 w-3.5 text-destructive" />
            <span>Save failed</span>
          </>
        ) : (
          <span>Edits autosave</span>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
