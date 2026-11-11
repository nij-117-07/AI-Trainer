// src/features/chatbot/components/MessageBubble.tsx
/** One message. User text sits in a bubble on the right; replies run full width with actions below. */
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { setStringAsync } from "expo-clipboard";
import { Check, Copy, RotateCw, Square, Volume2 } from "lucide-react-native";
import { shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { pointerCursor } from "@/components/tool/FormControls";
import type { ChatMessage, Persona } from "../types";
import { PersonaAvatar } from "./PersonaAvatar";

const SLOW_REPLY_MS = 10000;

export interface SpeechControls {
  ready: boolean;
  activeId: string | null;
  loadingId: string | null;
  onSpeak: (id: string, text: string) => void;
  onStop: () => void;
}

interface MessageBubbleProps {
  message: ChatMessage;
  persona: Persona;
  isLast: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
  speech: SpeechControls;
}

export function MessageBubble({ message, persona, isLast, canRegenerate, onRegenerate, speech }: MessageBubbleProps) {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);
  const [slow, setSlow] = useState(false);
  const streaming = message.status === "streaming";
  const hasText = message.content.trim() !== "";
  const waiting = streaming && !hasText;

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!waiting) return;
    const timer = setTimeout(() => setSlow(true), SLOW_REPLY_MS);
    return () => clearTimeout(timer);
  }, [waiting]);

  if (message.role === "user") {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, { backgroundColor: colors.muted }]}>
          <Text selectable style={[styles.userText, { color: colors.foreground }]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  const listenable = speech.ready && message.status === "done" && hasText;
  const loading = speech.loadingId === message.id;
  const playing = speech.activeId === message.id && !loading;
  const canRetry = isLast && canRegenerate;

  return (
    <View style={styles.assistantRow}>
      <PersonaAvatar emoji={persona.avatar} size={30} />
      <View style={styles.assistantBody} accessibilityLiveRegion={streaming ? "none" : "polite"}>
        <Text style={[styles.name, { color: colors.mutedForeground }]}>{persona.name}</Text>

        {waiting ? (
          <View style={styles.thinking}>
            <ActivityIndicator size="small" color={colors.mutedForeground} />
            <Text style={[styles.caption, { color: colors.mutedForeground }]}>{slow ? "Still working…" : "Thinking"}</Text>
          </View>
        ) : hasText ? (
          <MarkdownText content={message.content} />
        ) : null}
        {streaming && hasText ? (
          <ActivityIndicator size="small" color={colors.mutedForeground} accessibilityLabel="Writing reply" />
        ) : null}

        {message.status === "stopped" ? (
          <Text accessibilityLiveRegion="polite" style={[styles.caption, { color: colors.mutedForeground }]}>
            Stopped. This answer is incomplete.
          </Text>
        ) : null}

        {message.status === "error" && message.error ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
            {message.error}
          </Text>
        ) : null}

        {message.status === "error" && canRetry ? (
          <TextButton label="Try again" onPress={onRegenerate} outlined />
        ) : null}

        {!streaming ? (
          <View style={styles.actions}>
            {hasText ? (
              <ActionIcon
                label={copied ? "Copied" : "Copy reply"}
                onPress={() => {
                  void setStringAsync(message.content).then(() => setCopied(true));
                }}
              >
                {copied ? <Check size={16} color={colors.mutedForeground} /> : <Copy size={16} color={colors.mutedForeground} />}
              </ActionIcon>
            ) : null}
            {listenable ? (
              <ActionIcon
                label={loading || playing ? "Stop reading" : "Listen to reply"}
                onPress={() => {
                  if (loading || playing) speech.onStop();
                  else speech.onSpeak(message.id, message.content);
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.mutedForeground} />
                ) : playing ? (
                  <Square size={14} color={colors.primary} fill={colors.primary} />
                ) : (
                  <Volume2 size={16} color={colors.mutedForeground} />
                )}
              </ActionIcon>
            ) : null}
            {canRetry && (message.status === "done" || message.status === "stopped") ? (
              <TextButton label="Regenerate" onPress={onRegenerate}>
                <RotateCw size={16} color={colors.mutedForeground} />
              </TextButton>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ActionIcon({ label, onPress, children }: { label: string; onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.actionIcon, pointerCursor, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

function TextButton({
  label,
  onPress,
  outlined = false,
  children,
}: {
  label: string;
  onPress: () => void;
  outlined?: boolean;
  children?: React.ReactNode;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.textButton,
        outlined && { borderWidth: 1, borderColor: colors.border },
        pointerCursor,
        pressed && styles.pressed,
      ]}
    >
      {children}
      <Text style={[styles.textButtonLabel, { color: outlined ? colors.foreground : colors.mutedForeground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  userBubble: {
    maxWidth: "85%",
    borderRadius: shape.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userText: {
    ...typeScale.body,
  },
  assistantRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  assistantBody: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    ...typeScale.caption,
    fontWeight: "600",
  },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: touchTarget,
  },
  caption: {
    ...typeScale.caption,
  },
  error: {
    ...typeScale.label,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginLeft: -spacing.sm,
  },
  actionIcon: {
    width: touchTarget,
    height: touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  textButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: shape.full,
  },
  textButtonLabel: {
    ...typeScale.label,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.6,
  },
});
