// src/features/observation-trainer/components/ObservationForm.tsx
/**
 * Observation Trainer form, shown on its own page. The image search, the image, and the fields fill
 * the page body; the error and the training button sit in the footer. A successful training returns
 * to the report page.
 */
import { StyleSheet, Switch, Text, View } from "react-native";
import { Eye } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { ImagePickerField } from "@/components/tool/ImagePickerField";
import type { ObservationFormState } from "../hooks/useObservationForm";
import { CONTEXT_MAX, FOCUS_MAX, OBSERVATIONS_MAX, SCENARIO_MAX } from "../lib/validate";
import { ImageSearchPanel } from "./ImageSearchPanel";

export function ObservationFormFields({ training }: { training: ObservationFormState }) {
  const colors = useThemeColors();
  const { form, pending, update } = training;

  return (
    <>
      <ImageSearchPanel
        requirements={form.imageRequirements}
        onRequirementsChange={(text) => update("imageRequirements", text)}
        search={training.imageSearch}
        disabled={pending}
      />
      <ImagePickerField
        value={training.image}
        onChange={training.pickImage}
        disabled={pending}
        label="Image to observe"
        hint="Found above, or upload your own: PNG, JPG, or WEBP."
      />
      <TextField
        label="Training scenario"
        placeholder="e.g. Crime scene investigation"
        value={form.trainingScenario}
        onChangeText={(text) => update("trainingScenario", text)}
        editable={!pending}
        maxLength={SCENARIO_MAX}
      />
      <TextField
        label="What did you observe?"
        placeholder="Describe every detail you noticed in the image."
        value={form.userObservations}
        onChangeText={(text) => update("userObservations", text)}
        editable={!pending}
        maxLength={OBSERVATIONS_MAX}
        multiline
        voice
      />
      <TextField
        label="Context category (optional)"
        placeholder="e.g. portrait, x-ray, landscape"
        value={form.contextCategory}
        onChangeText={(text) => update("contextCategory", text)}
        editable={!pending}
        maxLength={CONTEXT_MAX}
      />
      <TextField
        label="Training focus (optional)"
        placeholder="e.g. body language, lighting, text"
        value={form.trainingFocus}
        onChangeText={(text) => update("trainingFocus", text)}
        editable={!pending}
        maxLength={FOCUS_MAX}
      />
      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: colors.foreground }]}>Reveal details I missed</Text>
        <Switch
          value={form.revealHidden}
          onValueChange={(value) => update("revealHidden", value)}
          disabled={pending}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>
    </>
  );
}

export function ObservationFormFooter({ training }: { training: ObservationFormState }) {
  const { pending, error, submit } = training;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Analyzing the image…" : "Train my observation"}
        icon={Eye}
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radius.lg,
  },
  switchLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
});
