// src/features/observation-trainer/components/ObservationTrainerScreen.tsx
/**
 * Observation Trainer: attach an image, describe what you noticed, and get a scored evaluation plus
 * the details you missed. The draft and last report are kept on the device.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { Eye, RefreshCcw } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { ImagePickerField } from "@/components/tool/ImagePickerField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import type { ImageInput } from "@/lib/image";
import { trainObservation } from "../lib/generators";
import { CONTEXT_MAX, FOCUS_MAX, OBSERVATIONS_MAX, SCENARIO_MAX } from "../lib/validate";
import { usePersistedTraining } from "../hooks/usePersistedTraining";
import type { ObservationFormValues } from "../types";
import { ObservationResult } from "./ObservationResult";
import { EmptyNote } from "./ResultParts";

export function ObservationTrainerScreen() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const { form, setForm, result, setResult, reset } = usePersistedTraining();
  const [image, setImage] = useState<ImageInput | null>(null);
  const request = useRequest(trainObservation);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof ObservationFormValues>(key: K, value: ObservationFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleTrain() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const next = await request.run(settings, { form, image }, controller.signal);
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
        <ImagePickerField
          value={image}
          onChange={setImage}
          disabled={request.pending}
          label="Image to observe"
          hint="PNG, JPG, or WEBP: the picture you will describe from memory."
        />
        <TextField
          label="Training scenario"
          placeholder="e.g. Crime scene investigation"
          value={form.trainingScenario}
          onChangeText={(text) => update("trainingScenario", text)}
          editable={!request.pending}
          maxLength={SCENARIO_MAX}
        />
        <TextField
          label="What did you observe?"
          placeholder="Describe every detail you noticed in the image."
          value={form.userObservations}
          onChangeText={(text) => update("userObservations", text)}
          editable={!request.pending}
          maxLength={OBSERVATIONS_MAX}
          multiline
        />
        <TextField
          label="Context category (optional)"
          placeholder="e.g. portrait, x-ray, landscape"
          value={form.contextCategory}
          onChangeText={(text) => update("contextCategory", text)}
          editable={!request.pending}
          maxLength={CONTEXT_MAX}
        />
        <TextField
          label="Training focus (optional)"
          placeholder="e.g. body language, lighting, text"
          value={form.trainingFocus}
          onChangeText={(text) => update("trainingFocus", text)}
          editable={!request.pending}
          maxLength={FOCUS_MAX}
        />
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: colors.foreground }]}>Reveal details I missed</Text>
          <Switch
            value={form.revealHidden}
            onValueChange={(value) => update("revealHidden", value)}
            disabled={request.pending}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <ActionButton
          label={request.pending ? "Analyzing the image…" : "Train my observation"}
          icon={Eye}
          loading={request.pending}
          onPress={handleTrain}
        />
      </Panel>

      <ErrorText message={request.error} />

      {result ? (
        <ObservationResult result={result} />
      ) : (
        <EmptyNote message="Upload an image, describe what you see, and the trainer will score your observation skills." />
      )}

      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={handleReset} />
    </Section>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
});
