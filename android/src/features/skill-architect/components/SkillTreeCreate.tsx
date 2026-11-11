// src/features/skill-architect/components/SkillTreeCreate.tsx
/** Create form for a new skill tree. Fields sit in the body; the footer holds the error and the one action. */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import type { SkillTreeCreateState } from "../hooks/useSkillTreeCreate";
import { SKILL_LIMITS } from "../lib/validate";

export function SkillTreeCreateForm({ state }: { state: SkillTreeCreateState }) {
  const { form, busy, update } = state;

  return (
    <View style={styles.fields}>
      <TextField
        label="Goal"
        placeholder="e.g. Docker, React, Machine Learning, Public Speaking"
        value={form.domainOrSkill}
        onChangeText={(text) => update("domainOrSkill", text)}
        editable={!busy}
        maxLength={SKILL_LIMITS.domainOrSkill}
      />
      <TextField
        label="Current level"
        placeholder="e.g. Absolute beginner, self-taught, one year of experience"
        value={form.currentProficiency}
        onChangeText={(text) => update("currentProficiency", text)}
        editable={!busy}
        maxLength={SKILL_LIMITS.currentProficiency}
        multiline
        voice
      />
      <TextField
        label="Target level"
        placeholder="e.g. Competent professional, industry expert"
        value={form.targetMasteryLevel}
        onChangeText={(text) => update("targetMasteryLevel", text)}
        editable={!busy}
        maxLength={SKILL_LIMITS.targetMasteryLevel}
      />
      <TextField
        label="Time and constraints (optional)"
        placeholder="e.g. 5 hours a week, prefers videos"
        value={form.learningConstraints}
        onChangeText={(text) => update("learningConstraints", text)}
        editable={!busy}
        maxLength={SKILL_LIMITS.learningConstraints}
        multiline
        voice
      />
    </View>
  );
}

export function SkillTreeCreateFooter({ state }: { state: SkillTreeCreateState }) {
  const { busy, error, submit } = state;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={busy ? "Creating skill tree…" : "Create skill tree"}
        icon={Sparkles}
        loading={busy}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.md,
  },
  footer: {
    gap: spacing.md,
  },
});
