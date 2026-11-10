// src/features/debate/components/DebatePersonas.tsx
/**
 * The two personas in a closed dropdown. Inside, Pro and Con sit side by side; tapping a column
 * shows that persona's details below.
 */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Users } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Disclosure } from "@/components/tool/Disclosure";
import { SIDE_CHOICES } from "../options";
import type { DebateSession, DebateSide } from "../types";
import type { DebateSessionState } from "../hooks/useDebateSession";
import { PersonaCard } from "./PersonaCard";

export function DebatePersonas({ game, session }: { game: DebateSessionState; session: DebateSession }) {
  const colors = useThemeColors();
  const [viewSide, setViewSide] = useState<DebateSide>("pro");
  const viewed = viewSide === "pro" ? session.proPersona : session.conPersona;
  const proName = session.proPersona.personaName || "Unnamed";
  const conName = session.conPersona.personaName || "Unnamed";

  return (
    <Disclosure title="Personas" icon={Users} summary={`Pro: ${proName} · Con: ${conName}`}>
      <View style={styles.columns}>
        {SIDE_CHOICES.map((choice) => {
          const persona = choice.value === "pro" ? session.proPersona : session.conPersona;
          const selected = viewSide === choice.value;
          return (
            <Pressable
              key={choice.value}
              onPress={() => setViewSide(choice.value)}
              accessibilityRole="tab"
              accessibilityLabel={`${choice.label} persona`}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.column,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: pressed ? colors.muted : colors.background,
                },
              ]}
            >
              <Text style={[styles.columnSide, { color: colors.mutedForeground }]}>
                {choice.value === "pro" ? "Pro · for" : "Con · against"}
              </Text>
              <Text numberOfLines={2} style={[styles.columnName, { color: colors.foreground }]}>
                {persona.personaName || "Unnamed persona"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PersonaCard
        key={viewSide}
        side={viewSide}
        persona={viewed}
        topic={session.topic}
        busy={game.busy}
        regenPending={game.regenerating}
        onSave={(persona) => game.savePersona(viewSide, persona)}
        onRegenerate={() => void game.regeneratePersona(viewSide)}
      />
    </Disclosure>
  );
}

const styles = StyleSheet.create({
  columns: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  column: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  columnSide: {
    fontSize: 12,
    fontWeight: "600",
  },
  columnName: {
    fontSize: 15,
    fontWeight: "600",
  },
});
