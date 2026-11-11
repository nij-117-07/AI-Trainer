// src/features/tutor/components/TutorScreen.tsx
/**
 * Adaptive Tutor. The question and its settings sit in the form; each answer is kept as a
 * version and shown on its own page, and the last question becomes the memory for the next answer.
 */
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ResetButton } from "@/components/tool/ResetButton";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import type { TutorFormValues } from "../types";
import { DEFAULT_TUTOR_FORM } from "../lib/options";
import { explainForStudent } from "../lib/generators";
import { advanceTurn, startFresh } from "../lib/tutor-input";
import { usePromptTemplates } from "../hooks/usePromptTemplates";
import { useResponseVersions } from "../hooks/useResponseVersions";
import { useTutorDraft } from "../hooks/useTutorDraft";
import { TutorForm, TutorFormFooter } from "./TutorForm";
import { TutorResults } from "./TutorResults";

export function TutorScreen() {
  const router = useRouter();
  const { settings } = useAiSettings();
  const { form, setForm } = useTutorDraft();
  const templates = usePromptTemplates();
  const versions = useResponseVersions();
  const request = useRequest(explainForStudent);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

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
      setPersonaError("Choose a teaching style first.");
      return;
    }
    const submitted = form;
    const result = await request.run(settings, submitted, persona.content);
    if (!result) return;
    versions.push(result);
    setForm(advanceTurn(submitted));
    setResultOpen(true);
  }

  function reset() {
    setForm(DEFAULT_TUTOR_FORM);
    setPersonaError(null);
    setResultOpen(false);
    versions.reset();
    request.reset();
  }

  return (
    <ToolScreen
      title="Tutor"
      headerRight={<ResetButton onPress={reset} accessibilityLabel="Reset tutor" />}
      footer={
        resultOpen ? (
          <ActionButton label="New question" icon={Plus} onPress={() => setResultOpen(false)} />
        ) : (
          <TutorFormFooter
            pending={request.pending}
            error={personaError ?? request.error ?? templates.error}
            onSubmit={() => void generate()}
          />
        )
      }
    >
      {resultOpen ? (
        <TutorResults
          active={versions.active}
          activeIndex={versions.activeIndex}
          total={versions.versions.length}
          lastTopic={form.lastTopicTaught}
          onGoTo={versions.goTo}
          onClear={versions.clear}
          onStartFresh={() => setForm(startFresh(form))}
        />
      ) : (
        <TutorForm
          form={form}
          personas={templates.templates}
          onChange={update}
          onManagePersonas={() => router.push("/learning/tutor/prompts" as never)}
          pending={request.pending}
        />
      )}
      {versions.pendingClear ? (
        <UndoSnackbar
          message={`Cleared ${versions.pendingClear.responses.length} answers`}
          onUndo={versions.undoClear}
          onDismiss={versions.commitClear}
        />
      ) : null}
    </ToolScreen>
  );
}
