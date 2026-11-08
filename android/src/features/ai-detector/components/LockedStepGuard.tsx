// src/features/ai-detector/components/LockedStepGuard.tsx
/** Shown when a later step is open without its prerequisite result, with a way back to Detect. */
import { StyleSheet, Text } from "react-native";
import { ArrowLeft, Lock } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";

interface LockedStepGuardProps {
  title: string;
  description: string;
  onBack: () => void;
}

export function LockedStepGuard({ title, description, onBack }: LockedStepGuardProps) {
  const colors = useThemeColors();
  return (
    <Panel>
      <Lock size={28} color={colors.mutedForeground} style={styles.icon} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
      <ActionButton label="Back to Detect" icon={ArrowLeft} variant="outline" onPress={onBack} />
    </Panel>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignSelf: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});
