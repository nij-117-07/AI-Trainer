// src/features/guides/components/ResultParts.tsx
/** Small result pieces shared by the Learning Guides tabs: titled lists and empty notes. */
import { StyleSheet, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { SectionTitle } from "@/components/tool/SectionTitle";

interface ListPanelProps {
  icon: LucideIcon;
  title: string;
  items: string[];
  numbered?: boolean;
}

export function ListPanel({ icon, title, items, numbered = false }: ListPanelProps) {
  const colors = useThemeColors();
  return (
    <Panel>
      <SectionTitle icon={icon} title={title} />
      {items.length === 0 ? (
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>Nothing was returned.</Text>
      ) : (
        <MarkdownText content={items.map((item, index) => (numbered ? `${index + 1}. ${item}` : `- ${item}`)).join("\n")} />
      )}
    </Panel>
  );
}

export function EmptyNote({ message }: { message: string }) {
  const colors = useThemeColors();
  return <Text style={[styles.empty, { color: colors.mutedForeground }]}>{message}</Text>;
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
