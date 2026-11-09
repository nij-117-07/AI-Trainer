// src/features/observation-trainer/components/ImageSearchPanel.tsx
/**
 * Find-an-image controls: a description box, the search button, and a strip of matching photos.
 * The first match loads on its own; tapping a thumbnail swaps it in. Native only, because the
 * found photo is downloaded to the device before it goes to the model.
 */
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Search } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { IMAGE_REQUIREMENTS_MAX } from "../lib/validate";
import type { useImageSearch } from "../hooks/useImageSearch";

interface ImageSearchPanelProps {
  requirements: string;
  onRequirementsChange: (text: string) => void;
  search: ReturnType<typeof useImageSearch>;
  disabled: boolean;
}

export function ImageSearchPanel({ requirements, onRequirementsChange, search, disabled }: ImageSearchPanelProps) {
  const colors = useThemeColors();

  if (Platform.OS === "web") {
    return (
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Image search runs in the Android app. On web, upload your own image below.
      </Text>
    );
  }

  const chosen = search.candidates.find((candidate) => candidate.id === search.chosenId) ?? null;
  const busy = disabled || search.pending;

  return (
    <View style={styles.stack}>
      <TextField
        label="Describe the picture"
        placeholder="e.g. a busy street market at dusk with a fruit seller"
        value={requirements}
        onChangeText={onRequirementsChange}
        editable={!busy}
        maxLength={IMAGE_REQUIREMENTS_MAX}
      />
      <ActionButton
        label={search.pending ? "Finding a photo…" : "Find image"}
        icon={Search}
        loading={search.pending}
        disabled={busy || !requirements.trim()}
        onPress={() => void search.find(requirements)}
      />
      {search.query ? (
        <Text style={[styles.note, { color: colors.mutedForeground }]}>
          Searched for: <Text style={{ color: colors.foreground, fontWeight: "600" }}>{search.query}</Text>
        </Text>
      ) : null}
      <ErrorText message={search.error} />

      {search.candidates.length > 0 ? (
        <View style={styles.stack}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
            {search.candidates.map((candidate) => {
              const selected = candidate.id === search.chosenId;
              return (
                <Pressable
                  key={candidate.id}
                  onPress={() => void search.choose(candidate)}
                  disabled={busy}
                  accessibilityRole="button"
                  accessibilityLabel={`Use photo: ${candidate.title}`}
                  accessibilityState={{ selected, disabled: busy }}
                  style={[styles.thumb, { borderColor: selected ? colors.primary : colors.border }]}
                >
                  <Image source={{ uri: candidate.imageUrl }} style={styles.thumbImage} resizeMode="cover" />
                </Pressable>
              );
            })}
          </ScrollView>
          {chosen ? (
            <Text
              onPress={chosen.pageUrl ? () => void Linking.openURL(chosen.pageUrl) : undefined}
              style={[styles.note, { color: colors.mutedForeground }]}
              numberOfLines={2}
            >
              {[chosen.title, chosen.license, chosen.artist].filter(Boolean).join(" · ")}
              {chosen.pageUrl ? " · Source" : ""}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
  },
  strip: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  thumb: {
    width: 112,
    height: 84,
    borderWidth: 2,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
