// src/features/testing-portal/hooks/useGraderSetup.ts
/**
 * The grader form on the New grade page. The text fields are kept on the device; the image is
 * not (it is large), so it clears when the user leaves the page. A grade replaces the saved one,
 * then calls onGraded.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { gradeAnswer } from "../lib/generators";
import { GRADER_STORAGE_KEYS, loadGraderResult } from "../lib/persistence";
import { GRADER_FORM_DEFAULTS } from "../options";
import type { ImageInput } from "../types";

type GraderForm = typeof GRADER_FORM_DEFAULTS;

export function useGraderSetup(onGraded: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedState<GraderForm>(GRADER_STORAGE_KEYS.form, GRADER_FORM_DEFAULTS);
  const [image, setImage] = useState<ImageInput | null>(null);
  const [hasGrade, setHasGrade] = useState(false);
  const grade = useRequest(gradeAnswer);

  useEffect(() => {
    let active = true;
    loadGraderResult().then((saved) => {
      if (active) setHasGrade(saved !== null);
    });
    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof GraderForm>(key: K, value: GraderForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const result = await grade.run(settings, { ...form, image });
    if (!result) return;
    await saveDocument(GRADER_STORAGE_KEYS.result, {
      questionAsked: form.questionAsked.trim(),
      userAnswerText: form.userAnswerText.trim(),
      hadImage: image !== null,
      grade: result,
    }).catch(() => undefined);
    onGraded();
  }

  function reset() {
    setForm(GRADER_FORM_DEFAULTS);
    setImage(null);
    grade.reset();
  }

  return {
    form,
    update,
    image,
    setImage,
    pending: grade.pending,
    error: grade.error,
    hasGrade,
    submit,
    reset,
  };
}

export type GraderSetupState = ReturnType<typeof useGraderSetup>;
