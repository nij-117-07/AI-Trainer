// src/features/poet-engine/components/PoetEngineForm.tsx
/**
 * Poet Engine form, shown on its own page. On a phone the fields fill the page body and the button is
 * pinned in the footer; on tablet and desktop the form sits in the side panel. A successful
 * explanation is saved and onGenerated returns to the Poet Engine page.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useLanguageProfiles } from "@/features/language-profiles/providers/LanguageProfilesProvider";
import { languagePair } from "@/features/language-profiles/lib/profiles";
import {
  ActionButton,
  ChoiceChips,
  ErrorText,
  Field,
  TextField,
} from "@/components/tool/FormControls";
import { useRequest } from "@/hooks/useRequest";
import { explainConcept } from "../lib/generators";
import { POET_ENGINE_RESULT_KEY, SAVE_FAILED_MESSAGE } from "../lib/persistence";
import { saveResult } from "../lib/result-store";
import { POETIC_STYLE_OPTIONS, POET_MOOD_OPTIONS } from "../options";
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

const CUSTOM = "__custom__";

export interface PoetEngineFormState {
  form: ConceptFormValues;
  pending: boolean;
  error: string | null;
  saveError: boolean;
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
  const { form, setForm, reset: resetForm, saveError } = usePersistedForm<ConceptFormValues>(DEFAULTS);
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
    await saveResult(POET_ENGINE_RESULT_KEY, explanation);
    onGenerated();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    saveError,
    update,
    submit,
    reset,
  };
}

interface ChoiceWithCustomProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  customLabel: string;
  customPlaceholder: string;
  customMaxLength: number;
}

/** Preset chips plus a Custom chip that shows a text field. A saved custom value keeps Custom selected. */
function ChoiceWithCustom({
  label,
  options,
  value,
  onChange,
  disabled,
  customLabel,
  customPlaceholder,
  customMaxLength,
}: ChoiceWithCustomProps) {
  const [customSelected, setCustomSelected] = useState(false);
  const isPreset = options.some((option) => option.value === value);
  const customMode = customSelected || !isPreset;

  return (
    <>
      <Field label={label}>
        <ChoiceChips
          options={[...options, { value: CUSTOM, label: "Custom" }]}
          value={customMode ? CUSTOM : value}
          onChange={(choice) => {
            if (choice === CUSTOM) {
              setCustomSelected(true);
              onChange("");
              return;
            }
            setCustomSelected(false);
            onChange(choice);
          }}
          disabled={disabled}
        />
      </Field>
      {customMode && (
        <TextField
          label={customLabel}
          placeholder={customPlaceholder}
          value={value}
          onChangeText={onChange}
          editable={!disabled}
          maxLength={customMaxLength}
        />
      )}
    </>
  );
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
      <ChoiceWithCustom
        label="Poetic style"
        options={POETIC_STYLE_OPTIONS}
        value={form.poeticStyle}
        onChange={(value) => update("poeticStyle", value)}
        disabled={pending}
        customLabel="Custom poetic style"
        customPlaceholder="e.g. Sonnet, Free verse, Limerick"
        customMaxLength={100}
      />
      <ChoiceWithCustom
        label="Mood (optional)"
        options={POET_MOOD_OPTIONS}
        value={form.userMood}
        onChange={(value) => update("userMood", value)}
        disabled={pending}
        customLabel="Custom mood"
        customPlaceholder="e.g. playful, bittersweet"
        customMaxLength={200}
      />
      <TextField
        label="Instructions (optional)"
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
  const { pending, error, saveError, submit } = poet;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ErrorText message={saveError ? SAVE_FAILED_MESSAGE : null} />
      <ActionButton
        label={pending ? "Explaining…" : "Explain the concept"}
        icon={Sparkles}
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
