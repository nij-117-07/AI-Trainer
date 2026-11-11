// src/features/skill-architect/components/SkillTreeUpdateFooter.tsx
/** Footer on the tree page: the learner says what they have done, and the tree is updated with what comes next. */
import { StyleSheet, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import type { SkillTreeState } from "../hooks/useSkillTree";
import { SKILL_LIMITS } from "../lib/validate";

export function SkillTreeUpdateFooter({ state }: { state: SkillTreeState }) {
  return (
    <View style={styles.footer}>
      <TextField
        label="What have you done since last time?"
        placeholder="e.g. Finished caching basics and built a small cache. Stuck on consistent hashing."
        value={state.progressNote}
        onChangeText={state.setProgressNote}
        editable={!state.pending}
        multiline
        maxLength={SKILL_LIMITS.progressNote}
        voice
        style={styles.note}
      />
      <ErrorText message={state.error} />
      <ActionButton
        label={state.pending ? "Working out next steps…" : "Get next steps"}
        icon={Sparkles}
        loading={state.pending}
        onPress={state.submitUpdate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  note: {
    minHeight: 80,
  },
});
