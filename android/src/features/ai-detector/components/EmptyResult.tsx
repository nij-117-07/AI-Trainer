// src/features/ai-detector/components/EmptyResult.tsx
/** Placeholder in the result area that tells the user which button produces the result. */
import { StyleSheet, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { SectionTitle } from "@/components/tool/SectionTitle";

interface EmptyResultProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyResult({ icon, title, description }: EmptyResultProps) {
  const colors = useThemeColors();
  return (
    <Panel>
      <SectionTitle icon={icon} title={title} />
      <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});
