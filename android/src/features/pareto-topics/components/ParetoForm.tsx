// src/features/pareto-topics/components/ParetoForm.tsx
/** New topic list page: the fields in the body, and Generate topics in the footer. */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import type { ParetoCreateState } from "../hooks/useParetoCreate";
import { paretoLevelOptions } from "../options";
import { FIELD_MAX, GOAL_MAX, INSTRUCTIONS_MAX, LEVEL_MAX } from "../lib/validate";

export function ParetoFormBody({ state }: { state: ParetoCreateState }) {
  const { form, pending, update } = state;

  return (
    <View style={styles.body}>
      <TextField
        label="Field or subject"
        placeholder="e.g. Data analysis"
        value={form.field}
        onChangeText={(text) => update("field", text)}
        editable={!pending}
        maxLength={FIELD_MAX}
      />
      <TextField
        label="Your goal"
        placeholder="e.g. Get a first job as an analyst"
        value={form.goal}
        onChangeText={(text) => update("goal", text)}
        editable={!pending}
        maxLength={GOAL_MAX}
      />
      <SelectField
        label="Level to achieve"
        options={paretoLevelOptions}
        value={form.level}
        onChange={(value) => update("level", value)}
        customPlaceholder="e.g. Principal analyst"
        disabled={pending}
      />
      <TextField
        label="Instructions (optional)"
        placeholder="e.g. Only free tools and courses"
        value={form.instructions}
        onChangeText={(text) => update("instructions", text)}
        editable={!pending}
        maxLength={INSTRUCTIONS_MAX}
        multiline
        voice
      />
    </View>
  );
}

export function ParetoFormFooter({ state }: { state: ParetoCreateState }) {
  const { pending, error, generate } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton label={pending ? "Generating topics…" : "Generate topics"} icon={Sparkles} loading={pending} onPress={generate} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
});
