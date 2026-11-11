// src/features/chatbot/components/PersonaSwitcher.tsx
/** Sheet for choosing the persona to chat with. Switching starts a new chat. Centered dialog on tablet and desktop. */
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check, SlidersHorizontal, X } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useLayout, useThemeColors } from "@/theme";
import { pointerCursor } from "@/components/tool/FormControls";
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
  const { size } = useLayout();
  const dialog = size !== "phone";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.root, dialog && styles.rootDialog]}>
        <Pressable style={styles.backdrop} onPress={onClose} accessible={false} />
        <View
          style={[
            styles.sheet,
            dialog ? styles.dialog : styles.bottomSheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>
                Choose a persona
              </Text>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>Switching starts a new chat.</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close personas"
              style={({ pressed }) => [styles.closeButton, pointerCursor, pressed && { backgroundColor: colors.muted }]}
            >
              <X size={18} color={colors.foreground} />
            </Pressable>
          </View>
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
                    pointerCursor,
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
            style={({ pressed }) => [
              styles.manage,
              pointerCursor,
              { borderColor: colors.border },
              pressed && { backgroundColor: colors.muted },
            ]}
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
  rootDialog: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.lg,
    maxHeight: "75%",
  },
  bottomSheet: {
    borderTopLeftRadius: shape.xl,
    borderTopRightRadius: shape.xl,
  },
  dialog: {
    width: "100%",
    maxWidth: 480,
    borderRadius: shape.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typeScale.title,
  },
  closeButton: {
    width: touchTarget,
    height: touchTarget,
    marginRight: -spacing.md,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    ...typeScale.caption,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: touchTarget,
    borderWidth: 1,
    borderRadius: shape.lg,
    padding: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typeScale.body,
    fontWeight: "600",
  },
  description: {
    ...typeScale.caption,
  },
  manage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    minHeight: touchTarget,
    borderWidth: 1,
    borderRadius: shape.full,
  },
  manageText: {
    ...typeScale.label,
    fontWeight: "600",
  },
});
