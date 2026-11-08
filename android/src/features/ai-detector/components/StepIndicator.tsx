// src/features/ai-detector/components/StepIndicator.tsx
/** Progress header for the wizard: Detect, Humanize, Re-detect, each done, current, or locked. */
import { StyleSheet, Text, View } from "react-native";
import { Check, Lock } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { STEP_ORDER, stepState, type StepState } from "../lib/analysis";
import type { WizardStep } from "../types";

const STEP_LABELS: Record<WizardStep, { label: string; description: string }> = {
  detect: { label: "Detect", description: "Scan text for AI patterns" },
  humanize: { label: "Humanize", description: "Rewrite it naturally" },
  recheck: { label: "Re-detect", description: "Verify the rewrite" },
};

interface StepIndicatorProps {
  step: WizardStep;
  canHumanize: boolean;
  canRecheck: boolean;
}

export function StepIndicator({ step, canHumanize, canRecheck }: StepIndicatorProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.row, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      {STEP_ORDER.map((key, index) => {
        const state: StepState = stepState(step, index, canHumanize, canRecheck);
        const locked = state === "locked";
        const { label, description } = STEP_LABELS[key];
        return (
          <View key={key} style={styles.step} accessibilityState={{ selected: state === "current" }}>
            <View style={[styles.badge, badgeStyle(state, colors)]}>
              {state === "done" ? (
                <Check size={14} color={colors.tone.emerald.fg} />
              ) : state === "locked" ? (
                <Lock size={12} color={colors.mutedForeground} />
              ) : (
                <Text style={[styles.badgeText, { color: colors.primaryForeground }]}>{index + 1}</Text>
              )}
            </View>
            <View style={styles.text}>
              <Text
                numberOfLines={1}
                style={[styles.label, { color: locked ? colors.mutedForeground : colors.foreground }]}
              >
                {label}
              </Text>
              <Text numberOfLines={2} style={[styles.description, { color: colors.mutedForeground }]}>
                {description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function badgeStyle(state: StepState, colors: ReturnType<typeof useThemeColors>) {
  if (state === "done") return { backgroundColor: colors.tone.emerald.bg };
  if (state === "current") return { backgroundColor: colors.primary };
  return { backgroundColor: colors.card };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  step: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  text: {
    flexShrink: 1,
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  description: {
    fontSize: 11,
    lineHeight: 14,
  },
});
