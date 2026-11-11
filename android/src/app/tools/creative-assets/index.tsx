// src/app/tools/creative-assets/index.tsx
import { useRouter } from "expo-router";
import { Palette, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { CreativeAssetsList } from "@/features/creative-assets/components/CreativeAssetsList";
import { likedTexts, toggleItem } from "@/features/creative-assets/lib/batches";
import { usePersistedResult } from "@/features/creative-assets/hooks/usePersistedDraft";

export default function CreativeAssetsRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const { result, setResult } = usePersistedResult();
  const liked = result ? likedTexts(result).length : 0;

  return (
    <ToolScreen
      title="Creative Assets"
      footer={
        <View style={styles.footer}>
          <ActionButton
            label={`More like these (${liked})`}
            icon={Sparkles}
            disabled={liked === 0}
            onPress={() => router.push("/tools/creative-assets/more")}
          />
          {liked === 0 && result ? (
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>Tick a suggestion to build on it.</Text>
          ) : null}
          <ActionButton
            label="New assets"
            icon={Palette}
            variant="outline"
            onPress={() => router.push("/tools/creative-assets/new")}
          />
        </View>
      }
    >
      <Section>
        {result ? (
          <CreativeAssetsList result={result} onToggle={(itemId) => setResult(toggleItem(result, itemId))} />
        ) : (
          <EmptyHint
            icon={Palette}
            title="No assets yet"
            hint="Tap New assets, choose a task type and topic, then generate."
          />
        )}
      </Section>
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});
