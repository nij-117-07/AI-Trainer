// src/features/prompt-generator/components/PromptGeneratorResult.tsx
/** Generated persona: its name, the full system prompt as selectable text, and the seed used. */
import { StyleSheet, Text, View } from "react-native";
import { Hash } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { ListenButton } from "@/components/tool/ListenButton";
import type { PersonaResult } from "../types";

export function PromptGeneratorResultView({ result }: { result: PersonaResult }) {
  const colors = useThemeColors();
  return (
    <Panel>
      <View style={styles.nameBlock}>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>Persona name</Text>
        <Text selectable accessibilityRole="header" style={[styles.name, { color: colors.foreground }]}>
          {result.personaName || "Untitled persona"}
        </Text>
      </View>

      <View style={[styles.promptBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Text selectable style={[styles.prompt, { color: colors.foreground }]}>
          {result.systemPrompt || "No system prompt was returned."}
        </Text>
      </View>
      {result.systemPrompt !== "" && (
        <View style={styles.actions}>
          <CopyButton text={result.systemPrompt} label="Copy system prompt" />
          <ListenButton text={result.systemPrompt} label="System prompt" />
        </View>
      )}

      {result.seedUsed !== "" && (
        <View style={[styles.seedRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
          <Hash size={16} color={colors.primary} />
          <Text style={[styles.caption, { color: colors.mutedForeground }]}>Seed used</Text>
          <Text selectable style={[styles.seed, { color: colors.foreground }]}>
            {result.seedUsed}
          </Text>
          <CopyButton text={result.seedUsed} label="Copy seed" />
        </View>
      )}
    </Panel>
  );
}

const styles = StyleSheet.create({
  nameBlock: {
    gap: spacing.xs,
  },
  caption: {
    ...typeScale.caption,
  },
  name: {
    ...typeScale.title,
  },
  promptBox: {
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  prompt: {
    ...typeScale.body,
  },
  seedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: shape.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  seed: {
    ...typeScale.label,
    fontFamily: "monospace",
  },
});
