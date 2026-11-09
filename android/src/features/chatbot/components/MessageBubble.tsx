// src/features/chatbot/components/MessageBubble.tsx
/** One message. User text sits in a bubble on the right; replies run full width with actions below. */
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { setStringAsync } from "expo-clipboard";
import { Check, Copy, RotateCw, Square, Volume2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { MarkdownText } from "@/components/tool/MarkdownText";
import type { ChatMessage, Persona } from "../types";
import { PersonaAvatar } from "./PersonaAvatar";

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

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

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

  const streaming = message.status === "streaming";
  const hasText = message.content.trim() !== "";
  const listenable = speech.ready && message.status === "done" && hasText;
  const loading = speech.loadingId === message.id;
  const playing = speech.activeId === message.id && !loading;

  return (
    <View style={styles.assistantRow}>
      <PersonaAvatar emoji={persona.avatar} size={30} />
      <View style={styles.assistantBody}>
        <Text style={[styles.name, { color: colors.mutedForeground }]}>{persona.name}</Text>

        {hasText ? <MarkdownText content={message.content} /> : streaming ? <ActivityIndicator color={colors.mutedForeground} /> : null}
        {streaming && hasText ? <ActivityIndicator size="small" color={colors.mutedForeground} /> : null}

        {message.status === "error" && message.error ? (
          <Text accessibilityRole="alert" style={[styles.error, { color: colors.destructive }]}>
            {message.error}
          </Text>
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
            {isLast && canRegenerate ? (
              <ActionIcon label="Regenerate reply" onPress={onRegenerate}>
                <RotateCw size={16} color={colors.mutedForeground} />
              </ActionIcon>
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
      hitSlop={8}
      style={({ pressed }) => [styles.actionIcon, pressed && styles.pressed]}
    >
      {children}
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
    borderRadius: radius["2xl"],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
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
    fontSize: 13,
    fontWeight: "600",
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  actionIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
