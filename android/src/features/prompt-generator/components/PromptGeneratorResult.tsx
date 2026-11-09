// src/features/prompt-generator/components/PromptGeneratorResult.tsx
/** Generated persona: its name, the full system prompt as selectable text, and the seed used. */
import { StyleSheet, Text, View } from "react-native";
import { Bot, Hash } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { PersonaResult } from "../types";

export function PromptGeneratorResultView({ result }: { result: PersonaResult }) {
  const colors = useThemeColors();
  return (
    <>
      <SectionTitle icon={Bot} title="Persona" />
      <Panel>
        <View style={styles.nameBlock}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>Persona name</Text>
          <Text selectable style={[styles.name, { color: colors.foreground }]}>
            {result.personaName || "Untitled persona"}
          </Text>
        </View>

        <View style={[styles.promptBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
          <Text selectable style={[styles.prompt, { color: colors.foreground }]}>
            {result.systemPrompt || "No system prompt was returned."}
          </Text>
        </View>
        <ListenButton text={result.systemPrompt} label="System prompt" />

        {result.seedUsed !== "" && (
          <View style={[styles.seedRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
            <Hash size={16} color={colors.primary} />
            <Text style={[styles.seedLabel, { color: colors.mutedForeground }]}>Seed used:</Text>
            <Text selectable style={[styles.seed, { color: colors.foreground }]}>
              {result.seedUsed}
            </Text>
          </View>
        )}
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  nameBlock: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  promptBox: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  prompt: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 21,
  },
  seedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  seedLabel: {
    fontSize: 14,
  },
  seed: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "600",
  },
});
