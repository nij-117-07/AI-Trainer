// src/features/chatbot/components/PersonaSwitcher.tsx
/** Bottom sheet for choosing the persona to chat with. Switching starts a new chat. */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check, SlidersHorizontal } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import type { Persona } from "../types";
import { PersonaAvatar } from "./PersonaAvatar";

interface PersonaSwitcherProps {
  visible: boolean;
  onClose: () => void;
  personas: Persona[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onManage: () => void;
}

export function PersonaSwitcher({ visible, onClose, personas, activeId, onSelect, onManage }: PersonaSwitcherProps) {
  const colors = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close personas" />
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Choose a persona</Text>
          <ScrollView contentContainerStyle={styles.list}>
            {personas.map((persona) => {
              const selected = persona.id === activeId;
              return (
                <Pressable
                  key={persona.id}
                  onPress={() => onSelect(persona.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Chat with ${persona.name}`}
                  accessibilityState={{ selected }}
                  style={({ pressed }) => [
                    styles.row,
                    { borderColor: selected ? colors.primary : colors.border },
                    pressed && { backgroundColor: colors.muted },
                  ]}
                >
                  <PersonaAvatar emoji={persona.avatar} size={36} />
                  <View style={styles.rowText}>
                    <Text style={[styles.name, { color: colors.foreground }]}>{persona.name}</Text>
                    {persona.description ? (
                      <Text numberOfLines={2} style={[styles.description, { color: colors.mutedForeground }]}>
                        {persona.description}
                      </Text>
                    ) : null}
                  </View>
                  {selected ? <Check size={18} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            onPress={onManage}
            accessibilityRole="button"
            accessibilityLabel="Manage personas"
            style={({ pressed }) => [styles.manage, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
          >
            <SlidersHorizontal size={16} color={colors.foreground} />
            <Text style={[styles.manageText, { color: colors.foreground }]}>Manage personas</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
    maxHeight: "75%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  manage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 46,
    borderWidth: 1,
    borderRadius: radius.full,
  },
  manageText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
