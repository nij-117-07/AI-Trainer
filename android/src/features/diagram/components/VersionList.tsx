// src/features/diagram/components/VersionList.tsx
/** Saved versions of the active format, newest first, so an earlier diagram can be restored. */
import { Pressable, StyleSheet, Text } from "react-native";
import { History } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { formatLabel } from "../options";
import type { DiagramFormat, DiagramVersion } from "../types";

const SNIPPET_MAX = 48;

interface VersionListProps {
  format: DiagramFormat;
  versions: DiagramVersion[];
  disabled: boolean;
  onRestore: (version: DiagramVersion) => void;
}

export function VersionList({ format, versions, disabled, onRestore }: VersionListProps) {
  const colors = useThemeColors();
  const matching = versions.filter((version) => version.format === format).reverse();
  if (matching.length === 0) return null;

  return (
    <Panel>
      <SectionTitle icon={History} title={`Restore a previous ${formatLabel(format)} version`} />
      {matching.map((version, index) => (
        <Pressable
          key={`${version.savedAt}-${index}`}
          onPress={() => onRestore(version)}
          disabled={disabled}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.row,
            { borderColor: colors.border, backgroundColor: colors.background },
            pressed && { backgroundColor: colors.muted },
          ]}
        >
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(version.savedAt)}</Text>
          <Text numberOfLines={1} style={[styles.snippet, { color: colors.foreground }]}>
            {codeSnippet(version.code)}
          </Text>
        </Pressable>
      ))}
    </Panel>
  );
}

function formatTime(savedAt: string): string {
  const date = new Date(savedAt);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function codeSnippet(code: string): string {
  const firstLine = (code.split("\n").find((line) => line.trim()) ?? "").trim();
  return firstLine.length > SNIPPET_MAX ? `${firstLine.slice(0, SNIPPET_MAX)}…` : firstLine;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  time: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  snippet: {
    flex: 1,
    fontSize: 14,
    fontFamily: "monospace",
  },
});
