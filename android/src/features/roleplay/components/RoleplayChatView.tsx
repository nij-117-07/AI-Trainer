// src/features/roleplay/components/RoleplayChatView.tsx
/**
 * Roleplay thread: the transcript, the jump-to-latest pill, and the error and message box pinned to
 * the bottom. The thread follows new replies only while the reader is at the bottom.
 */
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowDown, MessagesSquare } from "lucide-react-native";
import { contentWidth, shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isAiConfigured } from "@/features/ai-settings/lib/llm";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { ActionButton, ErrorText, Panel, pointerCursor } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { UndoSnackbar } from "@/components/tool/UndoSnackbar";
import type { RoleplayChatState } from "../hooks/useRoleplayChat";
import { MessageBubble } from "./MessageBubble";
import { RoleplayComposer } from "./RoleplayComposer";

const NEAR_BOTTOM_PX = 48;

export function RoleplayChatView({ chat, name }: { chat: RoleplayChatState; name: string }) {
  const colors = useThemeColors();
  const router = useRouter();
  const { settings: aiSettings, loaded: aiLoaded } = useAiSettings();
  const { settings, history, draft, pending, loaded, error } = chat;
  const scrollRef = useRef<ScrollViewInstance>(null);
  const followRef = useRef(true);
  const anchorRef = useRef<number | null>(null);
  const countRef = useRef(history.length);
  const prevCountRef = useRef(history.length);
  const [awayFrom, setAwayFrom] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const hasPersona = settings.systemPrompt.trim() !== "";
  const configured = isAiConfigured(aiSettings);
  const unseen =
    awayFrom === null ? 0 : history.slice(awayFrom).filter((message) => message.role === "assistant").length;
  countRef.current = history.length;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
  }, []);

  useEffect(() => {
    const count = history.length;
    const previous = prevCountRef.current;
    prevCountRef.current = count;
    if (count === 0) {
      followRef.current = true;
      setAwayFrom(null);
      return;
    }
    // Only a message sent just now moves the thread, so opening an old conversation lands at its end.
    if (count === previous + 1 && history[count - 1].role === "user") {
      anchorRef.current = count - 1;
    }
  }, [history]);

  function anchorUserMessage(index: number, y: number) {
    if (anchorRef.current !== index) return;
    anchorRef.current = null;
    followRef.current = false;
    scrollRef.current?.scrollTo({ y, animated: !reduceMotion });
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distance = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    const near = distance <= NEAR_BOTTOM_PX;
    followRef.current = near;
    setAwayFrom((previous) => (near ? null : (previous ?? countRef.current)));
  }

  function onContentSizeChange() {
    if (followRef.current) scrollRef.current?.scrollToEnd({ animated: false });
  }

  function jumpToLatest() {
    followRef.current = true;
    setAwayFrom(null);
    scrollRef.current?.scrollToEnd({ animated: !reduceMotion });
  }

  const notice =
    aiLoaded && !configured ? (
      <Panel>
        <Text style={[styles.noticeTitle, { color: colors.foreground }]}>AI model not configured</Text>
        <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
          Add a model name and API key in AI settings to start a conversation.
        </Text>
        <ActionButton label="Open AI settings" variant="outline" onPress={() => router.push("/admin/settings")} />
      </Panel>
    ) : null;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScroll={onScroll}
          scrollEventThrottle={100}
          onContentSizeChange={onContentSizeChange}
          accessibilityRole="list"
          accessibilityLabel="Conversation"
        >
          <View style={styles.column}>
            {!loaded ? (
              <View style={styles.loading}>
                {error ? (
                  <ErrorText message={error} />
                ) : (
                  <>
                    <ActivityIndicator color={colors.primary} />
                    <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.mutedForeground }]}>
                      Loading conversation…
                    </Text>
                  </>
                )}
              </View>
            ) : (
              <>
                {notice}
                <ActiveLanguageNotice />

                {history.length === 0 && !pending ? (
                  <EmptyHint
                    icon={MessagesSquare}
                    title="No conversation yet"
                    hint={hasPersona ? "Say something in character to begin." : "Write a persona to start the scene."}
                  />
                ) : (
                  history.map((message, index) => (
                    <View
                      key={index}
                      onLayout={
                        message.role === "user" ? (event) => anchorUserMessage(index, event.nativeEvent.layout.y) : undefined
                      }
                    >
                      <MessageBubble
                        message={message}
                        speaker={name}
                        onRegenerate={
                          message.stopped && index === history.length - 1 && !pending
                            ? () => void chat.regenerate()
                            : undefined
                        }
                      />
                    </View>
                  ))
                )}

                {pending ? (
                  <View style={styles.thinking} accessibilityLiveRegion="polite">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.status, { color: colors.mutedForeground }]}>Thinking</Text>
                  </View>
                ) : null}
              </>
            )}
          </View>
        </ScrollView>

        {awayFrom !== null ? (
          <View style={styles.jumpWrap} pointerEvents="box-none">
            <Pressable
              onPress={jumpToLatest}
              accessibilityRole="button"
              accessibilityLabel={unseen > 0 ? `Jump to latest, ${unseen} new` : "Jump to latest"}
              style={({ pressed }) => [
                styles.jump,
                pointerCursor,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { backgroundColor: colors.muted },
              ]}
            >
              <ArrowDown size={18} color={colors.foreground} />
              <Text style={[styles.jumpText, { color: colors.foreground }]}>
                {unseen > 0 ? `${unseen} new ${unseen === 1 ? "reply" : "replies"}` : "Jump to latest"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {chat.clearing ? (
          <UndoSnackbar message="Chat cleared" onUndo={chat.undoClear} onDismiss={chat.commitClear} />
        ) : null}
      </View>

      {loaded ? (
        <View style={styles.footer}>
          <View style={styles.footerColumn}>
            {error ? (
              <View style={styles.errorRow}>
                <ErrorText message={error} />
                {hasPersona && !pending && draft.trim() ? (
                  <Pressable
                    onPress={() => void chat.send()}
                    accessibilityRole="button"
                    accessibilityLabel="Retry sending message"
                    style={({ pressed }) => [styles.retry, pointerCursor, pressed && styles.pressed]}
                  >
                    <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            <RoleplayComposer
              value={draft}
              onChangeText={chat.editDraft}
              onSend={() => void chat.send()}
              onStop={chat.stop}
              pending={pending}
            />
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  column: {
    width: "100%",
    maxWidth: contentWidth.form,
    alignSelf: "center",
    gap: spacing.lg,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing["2xl"],
  },
  status: {
    ...typeScale.body,
  },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  jumpWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: spacing.sm,
  },
  jump: {
    minHeight: touchTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: shape.full,
    paddingHorizontal: spacing.lg,
  },
  jumpText: {
    ...typeScale.label,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  footerColumn: {
    width: "100%",
    maxWidth: contentWidth.form,
    alignSelf: "center",
    gap: spacing.xs,
  },
  errorRow: {
    gap: spacing.xs,
    alignItems: "flex-start",
  },
  retry: {
    minHeight: touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  retryText: {
    ...typeScale.label,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
  noticeTitle: {
    ...typeScale.title,
  },
  noticeText: {
    ...typeScale.body,
  },
});
