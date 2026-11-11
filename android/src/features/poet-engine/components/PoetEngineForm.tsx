// src/features/poet-engine/components/PoetEngineForm.tsx
/**
 * Poet Engine form, shown on its own page. On a phone the fields fill the page body and the button is
 * pinned in the footer; on tablet and desktop the form sits in the side panel. A successful
 * explanation is saved and onGenerated returns to the Poet Engine page.
 */
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import {
  ActionButton,
  ErrorText,
  TextField,
} from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { explainConcept } from "../lib/generators";
import { POET_ENGINE_RESULT_KEY } from "../lib/persistence";
import { POETIC_STYLE_OPTIONS } from "../options";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import type { ConceptFormValues } from "../types";

const DEFAULTS: ConceptFormValues = {
  targetLanguage: "Urdu",
  nativeLanguage: "English",
  conceptWord: "Ishq",
  poeticStyle: "Shayari/Couplet",
  userMood: "mystical",
  userCustomInstruction: "",
};

export interface PoetEngineFormState {
  form: ConceptFormValues;
  pending: boolean;
  error: string | null;
  update: <K extends keyof ConceptFormValues>(
    key: K,
    value: ConceptFormValues[K],
  ) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function usePoetEngineForm(onGenerated: () => void): PoetEngineFormState {
  const { settings } = useAiSettings();
  const { activeProfile } = useLanguageProfiles();
  const { form, setForm, reset: resetForm } = usePersistedForm<ConceptFormValues>(DEFAULTS);
  const request = useRequest(explainConcept);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof ConceptFormValues>(key: K, value: ConceptFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function reset() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    resetForm();
    request.reset();
  }

  async function submit() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const explanation = await request.run(settings, { ...form, ...languagePair(activeProfile) }, controller.signal);
    if (!explanation || controller.signal.aborted) return;
    await saveDocument(POET_ENGINE_RESULT_KEY, explanation).catch(() => undefined);
    onGenerated();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    update,
    submit,
    reset,
  };
}

export function PoetEngineFormFields({ poet }: { poet: PoetEngineFormState }) {
  const { form, pending, update } = poet;

  return (
    <>
      <TextField
        label="Concept word"
        placeholder="e.g. Ishq"
        value={form.conceptWord}
        onChangeText={(text) => update("conceptWord", text)}
        editable={!pending}
        maxLength={200}
      />
      <SelectField
        label="Poetic style"
        options={POETIC_STYLE_OPTIONS}
        value={form.poeticStyle}
        onChange={(value) => update("poeticStyle", value)}
        customPlaceholder="e.g. Sonnet, Free verse, Limerick"
      />
      <TextField
        label="User mood (optional)"
        placeholder="e.g. mystical, melancholic, joyful"
        value={form.userMood}
        onChangeText={(text) => update("userMood", text)}
        editable={!pending}
        maxLength={200}
      />
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. nature metaphors, urban settings…"
        value={form.userCustomInstruction}
        onChangeText={(text) => update("userCustomInstruction", text)}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
    </>
  );
}

export function PoetEngineFormFooter({ poet }: { poet: PoetEngineFormState }) {
  const { pending, error, submit } = poet;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Composing the soul of the word…" : "Explain the concept"}
        icon={Feather}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

export function PoetEngineFormSidePanel({ poet }: { poet: PoetEngineFormState }) {
  return (
    <View style={styles.sidePanel}>
      <PoetEngineFormFields poet={poet} />
      <PoetEngineFormFooter poet={poet} />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  sidePanel: {
    gap: spacing.lg,
  },
});
