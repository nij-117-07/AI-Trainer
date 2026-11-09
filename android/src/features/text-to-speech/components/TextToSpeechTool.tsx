// src/features/text-to-speech/components/TextToSpeechTool.tsx
/**
 * Text to Speech: the generated audio is shown first, then the text form (collapsible) to generate
 * audio with the speech model and voice from AI settings. Recent requests are kept on the device
 * so a text can be reused.
 */
import { createElement, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pause, Play, RotateCcw, Settings2, Volume2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SettingsToggle } from "@/components/tool/SettingsToggle";
import { useCollapsibleForm } from "@/hooks/useCollapsibleForm";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isSpeechConfigured, resolveSpeechConnection } from "@/features/ai-settings/lib/speech";
import { createPlayableClip, releaseClip } from "../lib/clip";
import { makeEntry, newEntryId, type SpeechEntry } from "../lib/history";
import { MAX_SPEECH_CHARS, synthesizeSpeech } from "../lib/synthesize";
import { useSpeechHistory } from "../hooks/useSpeechHistory";

const NOT_CONFIGURED = "Add the speech model, voice, base URL, and API key in AI settings first.";
const PREVIEW_CHARS = 90;
const isWeb = Platform.OS === "web";

interface GeneratedClip {
  uri: string;
  mimeType: string;
  sizeBytes: number;
  voice: string;
  generationId: string | null;
}

export function TextToSpeechTool() {
  const colors = useThemeColors();
  const router = useRouter();
  const { settings } = useAiSettings();
  const { entries, loaded, record, clear } = useSpeechHistory();
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clip, setClip] = useState<GeneratedClip | null>(null);
  const panel = useCollapsibleForm(clip !== null);
  const abortRef = useRef<AbortController | null>(null);
  const clipRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (clipRef.current) releaseClip(clipRef.current);
    };
  }, []);

  const connection = resolveSpeechConnection(settings);
  const configured = isSpeechConfigured(connection);
  const trimmed = text.trim();
  const overLimit = text.length > MAX_SPEECH_CHARS;

  async function generate() {
    setError(null);
    if (!configured) {
      setError(NOT_CONFIGURED);
      return;
    }
    if (!trimmed) {
      setError("Type some text to speak.");
      return;
    }
    if (overLimit) {
      setError(`Keep the text under ${MAX_SPEECH_CHARS} characters.`);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setGenerating(true);
    try {
      const generated = await synthesizeSpeech({ connection, text: trimmed, signal: controller.signal });
      const uri = await createPlayableClip(generated.bytes, generated.mimeType, newEntryId());
      if (clipRef.current) releaseClip(clipRef.current);
      clipRef.current = uri;
      if (!isWeb) player.replace(uri);
      setClip({
        uri,
        mimeType: generated.mimeType,
        sizeBytes: generated.bytes.byteLength,
        voice: connection.voice,
        generationId: generated.generationId,
      });
      record(
        makeEntry({
          text: trimmed,
          voice: connection.voice,
          model: connection.model,
          generationId: generated.generationId,
        })
      );
      panel.reset();
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "Speech generation failed.");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setGenerating(false);
    }
  }

  function togglePlayback() {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  function replay() {
    player.seekTo(0);
    player.play();
  }

  function reuse(entry: SpeechEntry) {
    setText(entry.text);
    setError(null);
    panel.open();
  }

  function reset() {
    abortRef.current?.abort();
    if (!isWeb) player.pause();
    if (clipRef.current) releaseClip(clipRef.current);
    clipRef.current = null;
    setClip(null);
    setText("");
    setError(null);
    setGenerating(false);
  }

  return (
    <Section>
      {clip ? (
        <Panel>
          <Text style={[styles.label, { color: colors.foreground }]}>Audio ready</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            {`Voice ${clip.voice} · ${clip.mimeType} · ${formatSize(clip.sizeBytes)}`}
            {clip.generationId ? ` · Generation ${clip.generationId}` : ""}
          </Text>

          {isWeb ? (
            createElement("audio", {
              src: clip.uri,
              controls: true,
              preload: "auto",
              style: { width: "100%" },
              onError: () => setError("The browser could not play this audio. Try generating it again or choose another voice."),
            })
          ) : (
            <View style={styles.playerRow}>
              <Pressable
                onPress={togglePlayback}
                disabled={!playerStatus.isLoaded}
                accessibilityRole="button"
                accessibilityLabel={playerStatus.playing ? "Pause audio" : "Play audio"}
                accessibilityState={{ disabled: !playerStatus.isLoaded }}
                style={({ pressed }) => [
                  styles.playButton,
                  { backgroundColor: colors.primary },
                  pressed && styles.pressed,
                  !playerStatus.isLoaded && styles.disabled,
                ]}
              >
                {playerStatus.playing ? (
                  <Pause size={22} color={colors.primaryForeground} />
                ) : (
                  <Play size={22} color={colors.primaryForeground} />
                )}
              </Pressable>
              <View style={styles.playerText}>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  {playerStatus.error ? "Playback failed" : playerStatus.isLoaded ? (playerStatus.playing ? "Playing" : "Ready to play") : "Loading audio…"}
                </Text>
                {playerStatus.error ? (
                  <Text style={[styles.hint, { color: colors.destructive }]}>{playerStatus.error}</Text>
                ) : null}
              </View>
              <Pressable
                onPress={replay}
                disabled={!playerStatus.isLoaded}
                accessibilityRole="button"
                accessibilityLabel="Play from the start"
                style={({ pressed }) => [styles.iconButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
              >
                <RotateCcw size={18} color={colors.foreground} />
              </Pressable>
            </View>
          )}

          <ActionButton label="Clear" variant="outline" onPress={reset} />
        </Panel>
      ) : null}

      <SettingsToggle
        title="Speech form"
        summary={trimmed || "Text to speak"}
        expanded={panel.expanded}
        onToggle={panel.toggle}
      />

      {panel.expanded ? (
        <Panel>
          <View style={styles.formBody}>
            <View style={styles.settingsRow}>
              <View style={styles.settingsText}>
                <Text style={[styles.label, { color: colors.foreground }]}>Using</Text>
                <Text style={[styles.hint, { color: colors.mutedForeground }]} accessibilityLabel="Speech model and voice">
                  {configured ? `${connection.model} · voice ${connection.voice}` : "No speech model or voice set yet."}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/admin/settings")}
                accessibilityRole="button"
                accessibilityLabel="Change speech model and voice in settings"
                style={({ pressed }) => [styles.settingsButton, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
              >
                <Settings2 size={16} color={colors.foreground} />
                <Text style={[styles.settingsButtonText, { color: colors.foreground }]}>Change</Text>
              </Pressable>
            </View>

            <TextField
              label="Text to speak"
              value={text}
              onChangeText={(value) => {
                setText(value);
                setError(null);
              }}
              placeholder="Type or paste the text to read aloud"
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={styles.textArea}
              accessibilityLabel="Text to speak"
            />
            <Text style={[styles.counter, { color: overLimit ? colors.destructive : colors.mutedForeground }]}>
              {text.length} / {MAX_SPEECH_CHARS}
            </Text>

            <ActionButton
              label={generating ? "Generating audio…" : "Generate speech"}
              icon={Volume2}
              loading={generating}
              onPress={generate}
            />

            <ErrorText message={error} />
          </View>
        </Panel>
      ) : null}

      {loaded && entries.length > 0 ? (
        <Panel>
          <View style={styles.historyHeader}>
            <Text style={[styles.label, { color: colors.foreground }]}>Recent</Text>
            <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel="Clear recent speech">
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>Clear list</Text>
            </Pressable>
          </View>
          {entries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => reuse(entry)}
              accessibilityRole="button"
              accessibilityLabel={`Use text: ${entry.text.slice(0, 40)}`}
              style={({ pressed }) => [styles.historyRow, { borderColor: colors.border }, pressed && { backgroundColor: colors.muted }]}
            >
              <Text style={[styles.historyText, { color: colors.foreground }]} numberOfLines={2}>
                {entry.text.length > PREVIEW_CHARS ? `${entry.text.slice(0, PREVIEW_CHARS).trimEnd()}…` : entry.text}
              </Text>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                {formatDate(entry.createdAt)} · {entry.voice}
              </Text>
            </Pressable>
          ))}
        </Panel>
      ) : null}
    </Section>
  );
}

function formatSize(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

const styles = StyleSheet.create({
  formBody: {
    gap: spacing.xl,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  settingsText: {
    flex: 1,
    gap: spacing.xs,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  textArea: {
    minHeight: 160,
  },
  counter: {
    fontSize: 12,
    textAlign: "right",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  playerText: {
    flex: 1,
    gap: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyRow: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  historyText: {
    fontSize: 15,
    lineHeight: 21,
  },
});
