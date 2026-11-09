// src/features/chatbot/components/EmptyChat.tsx
/** Shown before the first message: the persona's introduction and its starter prompts. */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { Persona } from "../types";
import { PersonaAvatar } from "./PersonaAvatar";

interface EmptyChatProps {
  persona: Persona;
  onPick: (starter: string) => void;
}

export function EmptyChat({ persona, onPick }: EmptyChatProps) {
  const colors = useThemeColors();
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PersonaAvatar emoji={persona.avatar} size={64} />
      <Text style={[styles.title, { color: colors.foreground }]}>{persona.name}</Text>
      <Text style={[styles.description, { color: colors.mutedForeground }]}>
        {persona.description || "Ask anything to start a new chat."}
      </Text>
      {persona.starters.length > 0 ? (
        <View style={styles.starters}>
          {persona.starters.map((starter) => (
            <Pressable
              key={starter}
              onPress={() => onPick(starter)}
              accessibilityRole="button"
              accessibilityLabel={`Use prompt: ${starter}`}
              style={({ pressed }) => [
                styles.starter,
                { borderColor: colors.border, backgroundColor: colors.card },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[styles.starterText, { color: colors.foreground }]}>{starter}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 420,
  },
  starters: {
    width: "100%",
    maxWidth: 480,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  starter: {
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  starterText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
