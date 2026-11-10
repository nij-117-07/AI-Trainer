// src/features/creative-assets/components/CreativeAssetsMore.tsx
/**
 * "More like these" page, shown on its own page. The ticked suggestions are listed at the top of
 * the body, then the optional instructions. Generating adds a new batch to the saved list, with
 * every item already ticked, and returns to the results.
 */
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Sparkles, ThumbsUp } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { generateMoreCreativeAssets } from "../lib/generators";
import { keepLikedOnly, likedTexts, newBatch, nextBatchLabel } from "../lib/batches";
import { loadCreativeAssetsResult, saveCreativeAssetsResult, usePersistedResult } from "../hooks/usePersistedDraft";

export interface CreativeAssetsMoreState {
  liked: string[];
  loaded: boolean;
  instructions: string;
  setInstructions: (instructions: string) => void;
  pending: boolean;
  error: string | null;
  submit: () => Promise<void>;
}

export function useCreativeAssetsMore(onGenerated: () => void): CreativeAssetsMoreState {
  const { settings } = useAiSettings();
  const { result, loaded } = usePersistedResult();
  const [instructions, setInstructions] = useState("");
  const request = useRequest(generateMoreCreativeAssets);
  const controllerRef = useRef<AbortController | null>(null);
  const liked = result ? likedTexts(result) : [];

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function submit() {
    if (!result || liked.length === 0) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const suggestions = await request.run(
      settings,
      {
        taskType: result.form.taskType,
        userQuery: result.form.userQuery,
        context: result.form.context,
        numberOfSuggestions: result.form.numberOfSuggestions,
        likedSuggestions: liked,
        userInstructions: instructions,
      },
      controller.signal,
    );
    if (!suggestions || controller.signal.aborted) return;

    const latest = await loadCreativeAssetsResult();
    if (!latest) return;
    const round = latest.rounds + 1;
    const batch = newBatch(nextBatchLabel(round, liked.length), suggestions, true);
    const kept = keepLikedOnly(latest);
    await saveCreativeAssetsResult({ ...kept, rounds: round, batches: [...kept.batches, batch] }).catch(() => undefined);
    onGenerated();
  }

  return {
    liked,
    loaded,
    instructions,
    setInstructions,
    pending: request.pending,
    error: request.error,
    submit,
  };
}

export function CreativeAssetsMoreFields({ more }: { more: CreativeAssetsMoreState }) {
  const colors = useThemeColors();
  const { liked, loaded, instructions, setInstructions, pending } = more;

  if (!loaded) return null;
  if (liked.length === 0) {
    return (
      <Text style={[styles.missing, { color: colors.mutedForeground }]}>
        Tick at least one suggestion on the results page first.
      </Text>
    );
  }

  return (
    <>
      <Panel>
        <SectionTitle icon={ThumbsUp} title={`Liked (${liked.length})`} />
        {liked.map((text) => (
          <Text key={text} style={[styles.liked, { color: colors.foreground }]}>
            • {text}
          </Text>
        ))}
      </Panel>
      <TextField
        label="User instructions (optional)"
        placeholder="e.g. Shorter, more playful, avoid puns."
        value={instructions}
        onChangeText={setInstructions}
        editable={!pending}
        maxLength={1000}
        multiline
        voice
      />
    </>
  );
}

export function CreativeAssetsMoreFooter({ more }: { more: CreativeAssetsMoreState }) {
  const { liked, pending, error, submit } = more;

  return (
    <View style={styles.footer}>
      <ErrorText message={error} />
      <ActionButton
        label={pending ? "Generating more…" : "Generate more"}
        icon={Sparkles}
        loading={pending}
        disabled={liked.length === 0}
        onPress={submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  liked: {
    fontSize: 15,
    lineHeight: 22,
  },
  missing: {
    fontSize: 14,
    lineHeight: 20,
  },
});
