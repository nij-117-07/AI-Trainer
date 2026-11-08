// src/features/ingredients/components/IngredientsTab.tsx
/**
 * Ingredients Checker. Pick a photo of a product's ingredients list (and optionally paste the
 * text), then get a 1-5 health level with the reasons behind it. "Reset" clears the draft.
 */
import { useEffect, useRef, useState } from "react";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ImagePickerField } from "@/components/tool/ImagePickerField";
import { Section } from "@/components/tool/Section";
import type { ImageInput } from "@/lib/image";
import { checkIngredients } from "../lib/generators";
import { MANUAL_TEXT_MAX_LENGTH } from "../lib/validate";
import { usePersistedCheck } from "../hooks/usePersistedCheck";
import { IngredientsResult } from "./IngredientsResult";

export function IngredientsTab() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedCheck();
  const [image, setImage] = useState<ImageInput | null>(null);
  const request = useRequest(checkIngredients);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function handleCheck() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, { ...form, image }, controller.signal);
    if (next) setResult(next);
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    setImage(null);
    request.reset();
  }

  return (
    <Section>
      <Panel>
        <ImagePickerField value={image} onChange={setImage} disabled={request.pending} />
        <TextField
          label="Manual text (optional)"
          placeholder="e.g. water, sugar, citric acid"
          hint="Paste the ingredient list if the photo is blurry."
          value={form.manualText}
          onChangeText={(text) => setForm((prev) => ({ ...prev, manualText: text }))}
          editable={!request.pending}
          maxLength={MANUAL_TEXT_MAX_LENGTH}
          multiline
        />
        <ActionButton
          label={request.pending ? "Reading label…" : "Analyze Ingredients"}
          icon={Sparkles}
          loading={request.pending}
          onPress={handleCheck}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result && <IngredientsResult result={result} />}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}
