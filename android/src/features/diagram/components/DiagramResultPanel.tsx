// src/features/diagram/components/DiagramResultPanel.tsx
/** Diagram Generator output: the explanation, the live preview or Draw.io editor, and the code. */
import { StyleSheet, Text, View } from "react-native";
import { Code, Eye, GitBranch, Lightbulb, Play, RotateCcw } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { formatLabel } from "../options";
import type { DiagramResult } from "../types";
import { DrawioEditor } from "./DrawioEditor";
import { MermaidPreview } from "./MermaidPreview";

interface DiagramResultPanelProps {
  result: DiagramResult;
  isMermaid: boolean;
  previewCode: string;
  onRender: () => void;
  onDrawioSave: (xml: string) => void;
  onDrawioReload: () => void;
  editorVersion: number;
}

export function DiagramResultPanel({
  result,
  isMermaid,
  previewCode,
  onRender,
  onDrawioSave,
  onDrawioReload,
  editorVersion,
}: DiagramResultPanelProps) {
  const colors = useThemeColors();
  const codeToShow = isMermaid ? result.code : previewCode || result.code;

  return (
    <Section>
      {result.message !== "" && (
        <ResultCallout icon={Lightbulb} title="Summary" tone="sky">
          <MarkdownText content={result.message} />
          <ListenButton text={result.message} label="Summary" />
        </ResultCallout>
      )}

      <Panel>
        {isMermaid ? (
          <>
            <SectionTitle icon={GitBranch} title="Preview" />
            <MermaidPreview code={previewCode} />
            <ActionButton label="Render existing code" icon={Play} variant="outline" onPress={onRender} />
          </>
        ) : (
          <>
            <SectionTitle icon={Eye} title="Draw.io editor" />
            {previewCode.trim() ? (
              <>
                <DrawioEditor key={editorVersion} xml={previewCode} onSave={onDrawioSave} />
                <ActionButton
                  label="Reload from saved code"
                  icon={RotateCcw}
                  variant="outline"
                  onPress={onDrawioReload}
                />
              </>
            ) : (
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>Nothing to edit yet.</Text>
            )}
          </>
        )}
      </Panel>

      <Panel>
        <View style={styles.codeHeader}>
          <SectionTitle icon={Code} title="Diagram code" />
          <Text style={[styles.badge, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>
            {formatLabel(result.format)}
          </Text>
        </View>
        <View style={[styles.codeBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Text selectable style={[styles.code, { color: colors.foreground }]}>
            {codeToShow}
          </Text>
        </View>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>Long-press the code to copy it.</Text>
      </Panel>
    </Section>
  );
}

const styles = StyleSheet.create({
  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  badge: {
    overflow: "hidden",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: 12,
    fontWeight: "600",
  },
  codeBox: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  code: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  hint: {
    fontSize: 12,
  },
});
