// src/features/ingredients/components/IngredientsTab.tsx
/**
 * Ingredients Checker. Pick a photo of a product's ingredients list (and optionally paste the
 * text), then get a 1-5 health level with the reasons behind it. "Reset" clears the draft.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { RefreshCcw, Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useCollapsibleForm } from "@/hooks/useCollapsibleForm";
import { useRequest } from "@/hooks/useRequest";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ImagePickerField } from "@/components/tool/ImagePickerField";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import type { ImageInput } from "@/lib/image";
import { checkIngredients } from "../lib/generators";
import { MANUAL_TEXT_MAX_LENGTH } from "../lib/validate";
import { usePersistedCheck } from "../hooks/usePersistedCheck";
import { IngredientsResult } from "./IngredientsResult";

export function IngredientsTab() {
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedCheck();
  const [image, setImage] = useState<ImageInput | null>(null);
  const panel = useCollapsibleForm(result !== null);
  const request = useRequest(checkIngredients);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function handleCheck() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, { ...form, image }, controller.signal);
    if (next) {
      setResult(next);
      panel.reset();
    }
  }

  function handleReset() {
    controllerRef.current?.abort();
    reset();
    setImage(null);
    panel.reset();
    request.reset();
  }

  return (
    <Section>
      <ErrorText message={request.error} />

      {result && <IngredientsResult result={result} />}

      <SettingsToggle
        title="Ingredients form"
        summary={form.manualText.trim() || (image ? "Photo selected" : "Photo or pasted ingredients")}
        expanded={panel.expanded}
        onToggle={panel.toggle}
      />

      {panel.expanded ? (
        <Panel>
          <View style={styles.formBody}>
            <ImagePickerField
              value={image}
              onChange={setImage}
              disabled={request.pending}
              label="Ingredients photo"
              hint="PNG, JPG, or WEBP: a clear photo of the ingredients list."
            />
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
            <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
          </View>
        </Panel>
      ) : null}
    </Section>
  );
}

const styles = StyleSheet.create({
  formBody: {
    gap: spacing.xl,
  },
});
