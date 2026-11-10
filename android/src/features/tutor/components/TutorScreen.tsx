// src/features/tutor/components/TutorScreen.tsx
/**
 * Adaptive Tutor. The question and its settings sit in the footer. Each answer is kept as a
 * version, and the last question becomes the memory for the next answer.
 */
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ResetButton } from "@/components/tool/ResetButton";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import type { TutorFormValues } from "../types";
import { DEFAULT_TUTOR_FORM } from "../lib/options";
import { explainForStudent } from "../lib/generators";
import { advanceTurn, startFresh } from "../lib/tutor-input";
import { usePromptTemplates } from "../hooks/usePromptTemplates";
import { useResponseVersions } from "../hooks/useResponseVersions";
import { useTutorDraft } from "../hooks/useTutorDraft";
import { TutorForm } from "./TutorForm";
import { TutorResults } from "./TutorResults";

export function TutorScreen() {
  const router = useRouter();
  const { settings } = useAiSettings();
  const { form, setForm } = useTutorDraft();
  const templates = usePromptTemplates();
  const versions = useResponseVersions();
  const request = useRequest(explainForStudent);
  const [personaError, setPersonaError] = useState<string | null>(null);

  const { reload: reloadTemplates } = templates;
  useFocusEffect(
    useCallback(() => {
      void reloadTemplates();
    }, [reloadTemplates]),
  );

  const persona = templates.templates.find((template) => template.name === form.persona) ?? null;

  function update(patch: Partial<TutorFormValues>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function generate() {
    setPersonaError(null);
    if (!persona) {
      setPersonaError("Choose a persona first.");
      return;
    }
    const submitted = form;
    const result = await request.run(settings, submitted, persona.content);
    if (!result) return;
    versions.push(result);
    setForm(advanceTurn(submitted));
  }

  function reset() {
    setForm(DEFAULT_TUTOR_FORM);
    setPersonaError(null);
    versions.reset();
    request.reset();
  }

  return (
    <ToolScreen
      title="Adaptive Tutor"
      headerRight={<ResetButton onPress={reset} />}
      footer={
        <TutorForm
          form={form}
          personas={templates.templates}
          onChange={update}
          onSubmit={() => void generate()}
          onManagePersonas={() => router.push("/learning/tutor/prompts" as never)}
          pending={request.pending}
          error={personaError ?? request.error ?? templates.error}
        />
      }
    >
      <TutorResults
        active={versions.active}
        activeIndex={versions.activeIndex}
        total={versions.versions.length}
        lastTopic={form.lastTopicTaught}
        onGoTo={versions.goTo}
        onClear={() => {
          versions.reset();
          request.reset();
        }}
        onStartFresh={() => setForm(startFresh(form))}
      />
    </ToolScreen>
  );
}
