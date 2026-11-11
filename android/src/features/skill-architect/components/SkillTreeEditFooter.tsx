// src/features/skill-architect/components/SkillTreeEditFooter.tsx
/** Footer while a tree is being edited: the one action that saves the levels. Cancel is in the top bar. */
import { StyleSheet, View } from "react-native";
import { Check } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import type { SkillTreeState } from "../hooks/useSkillTree";

export function SkillTreeEditFooter({ state }: { state: SkillTreeState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={state.error} />
      <ActionButton label="Save changes" icon={Check} onPress={() => void state.saveEdit()} />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});
