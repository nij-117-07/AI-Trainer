// src/features/flexible-writer/components/FlexibleWriterResult.tsx
/** Flexible Writer output: the summary message and the transformed data as selectable text. */
import { StyleSheet, Text } from "react-native";
import { FileText, Lightbulb } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { Panel } from "@/components/tool/FormControls";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { FlexibleWriterResult } from "../types";

export function FlexibleWriterResultView({ result }: { result: FlexibleWriterResult }) {
  const colors = useThemeColors();
  return (
    <>
      {result.answerMessage !== "" && (
        <ResultCallout icon={Lightbulb} title="Summary" tone="sky">
          <MarkdownText content={result.answerMessage} />
        </ResultCallout>
      )}

      <SectionTitle icon={FileText} title="Transformed data" />
      <Panel>
        {result.updatedData === "" ? (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No transformed data was returned.</Text>
        ) : (
          <Text selectable style={[styles.code, { color: colors.foreground }]}>
            {result.updatedData}
          </Text>
        )}
      </Panel>
    </>
  );
}

const styles = StyleSheet.create({
  code: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 21,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
