// src/features/creative-assets/components/CreativeAssetsList.tsx
/** Creative asset output: each round as its own batch, with a tick on every suggestion. */
import { StyleSheet, View } from "react-native";
import { Lightbulb, Palette } from "lucide-react-native";
import { spacing } from "@/theme";
import { CheckboxRow } from "@/components/tool/CheckboxRow";
import { Panel } from "@/components/tool/FormControls";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ResultCallout } from "@/components/tool/ResultCallout";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { CreativeAssetsResult } from "../types";

export function CreativeAssetsList({ result, onToggle }: { result: CreativeAssetsResult; onToggle: (itemId: string) => void }) {
  return (
    <>
      {result.batches.map((batch) => (
        <View key={batch.id} style={styles.batch}>
          <SectionTitle icon={Palette} title={batch.label} />
          {batch.items.map((item) => (
            <Panel key={item.id}>
              <CheckboxRow label={item.suggestion} checked={item.liked} onToggle={() => onToggle(item.id)} />
              {item.explanation !== "" && (
                <ResultCallout icon={Lightbulb} title="Why it works" tone="amber">
                  <MarkdownText content={item.explanation} />
                  <ListenButton text={item.explanation} label="Explanation" />
                </ResultCallout>
              )}
            </Panel>
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  batch: {
    gap: spacing.lg,
  },
});
