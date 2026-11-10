// src/features/skill-architect/components/SkillTreeCreate.tsx
/** Create form for a new skill tree. The form sits in the footer; the tree opens on its detail page once saved. */
import { ScrollView, StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import type { SkillTreeCreateState } from "../hooks/useSkillTreeCreate";
import { SKILL_LIMITS } from "../lib/validate";

export function SkillTreeCreateFooter({ state }: { state: SkillTreeCreateState }) {
  const { form, busy, error, update, submit } = state;

  return (
    <View style={styles.footer}>
      <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent} keyboardShouldPersistTaps="handled">
        <TextField
          label="Topic or domain"
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
          label="Constraints (optional)"
          placeholder="e.g. 5 hours a week, prefers videos"
          value={form.learningConstraints}
          onChangeText={(text) => update("learningConstraints", text)}
          editable={!busy}
          maxLength={SKILL_LIMITS.learningConstraints}
          multiline
          voice
        />
      </ScrollView>
      <ErrorText message={error} />
      <ActionButton
        label={busy ? "Deconstructing skills…" : "Generate skill tree"}
        icon={Sparkles}
        loading={busy}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  fields: {
    maxHeight: 340,
  },
  fieldsContent: {
    gap: spacing.md,
  },
});
