// src/features/ingredients/components/IngredientsForm.tsx
/**
 * Ingredients Checker form, shown on its own page. The photo and text fill the page body; the
 * analyze button is pinned in the footer. A successful check saves the analysis and calls
 * onChecked, which returns to the Ingredients page.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { ImagePickerField } from "@/components/tool/ImagePickerField";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import type { ImageInput } from "@/lib/image";
import { checkIngredients } from "../lib/generators";
import { INGREDIENTS_RESULT_KEY } from "../lib/persistence";
import { MANUAL_TEXT_MAX_LENGTH } from "../lib/validate";
import { usePersistedForm } from "../hooks/usePersistedDraft";
import type { IngredientsFormValues } from "../types";

export interface IngredientsFormState {
  form: IngredientsFormValues;
  image: ImageInput | null;
  setImage: (image: ImageInput | null) => void;
  setManualText: (manualText: string) => void;
  pending: boolean;
  error: string | null;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useIngredientsForm(onChecked: () => void): IngredientsFormState {
  const { settings } = useAiSettings();
  const { form, setForm, reset: resetForm } = usePersistedForm();
  const [image, setImage] = useState<ImageInput | null>(null);
  const request = useRequest(checkIngredients);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function setManualText(manualText: string) {
    setForm((prev) => ({ ...prev, manualText }));
  }

  function reset() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    resetForm();
    setImage(null);
    request.reset();
  }

  async function submit() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const result = await request.run(settings, { ...form, image }, controller.signal);
    if (!result || controller.signal.aborted) return;
    await saveDocument(INGREDIENTS_RESULT_KEY, result).catch(() => undefined);
    onChecked();
  }

  return {
    form,
    image,
    setImage,
    setManualText,
    pending: request.pending,
    error: request.error,
    submit,
    reset,
  };
}

export function IngredientsFormFields({ ingredients }: { ingredients: IngredientsFormState }) {
  const { form, image, setImage, setManualText, pending } = ingredients;

  return (
    <>
      <ImagePickerField
        value={image}
        onChange={setImage}
        disabled={pending}
        label="Ingredients photo"
        hint="PNG, JPG, or WEBP: a clear photo of the ingredients list."
      />
      <TextField
        label="Manual text (optional)"
        placeholder="e.g. water, sugar, citric acid"
        hint="Paste the ingredient list if the photo is blurry."
        value={form.manualText}
        onChangeText={setManualText}
        editable={!pending}
        maxLength={MANUAL_TEXT_MAX_LENGTH}
        multiline
        voice
      />
    </>
  );
}

export function IngredientsFormFooter({ ingredients }: { ingredients: IngredientsFormState }) {
  const { pending, error, submit } = ingredients;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Reading label…" : "Analyze Ingredients"}
        icon={Sparkles}
        loading={pending}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});
