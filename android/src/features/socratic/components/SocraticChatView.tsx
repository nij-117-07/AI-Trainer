// src/features/socratic/components/SocraticChatView.tsx
/**
 * Socratic Challenger discussion: the thread, the jump-to-latest pill, and the message box pinned
 * to the bottom. The thread follows new replies only while the reader is at the bottom.
 */
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
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
import { ArrowDown, ListChecks, MessagesSquare } from "lucide-react-native";
import { contentWidth, shape, spacing, touchTarget, typeScale, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { isAiConfigured } from "@/features/ai-settings/lib/llm";
import { ActionButton, Panel, pointerCursor } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import type { SocraticChatState } from "../hooks/useSocraticChat";
import { ChatBubble } from "./ChatBubble";
import { ChatComposer } from "./ChatComposer";
import { ThinkingRow } from "./ThinkingRow";

const NEAR_BOTTOM_PX = 48;

export function SocraticChatView({ chat }: { chat: SocraticChatState }) {
  const colors = useThemeColors();
  const router = useRouter();
  const { settings, loaded } = useAiSettings();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const followRef = useRef(true);
  const anchorRef = useRef<number | null>(null);
  const countRef = useRef(chat.messages.length);
  const prevCountRef = useRef(chat.messages.length);
  const [awayFrom, setAwayFrom] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const started = chat.messages.length > 0;
  const configured = isAiConfigured(settings);
  const unseen =
    awayFrom === null ? 0 : chat.messages.slice(awayFrom).filter((message) => message.role === "assistant").length;
  countRef.current = chat.messages.length;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
  }, []);

  useEffect(() => {
    const count = chat.messages.length;
    const previous = prevCountRef.current;
    prevCountRef.current = count;
    if (count === 0) {
      followRef.current = true;
      setAwayFrom(null);
      return;
    }
    // Only a message sent just now moves the thread, so opening an old discussion lands at its end.
    if (count === previous + 1 && chat.messages[count - 1].role === "user") {
      anchorRef.current = count - 1;
    }
  }, [chat.messages]);

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
    loaded && !configured ? (
      <Panel>
        <Text style={[styles.noticeTitle, { color: colors.foreground }]}>AI model not configured</Text>
        <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
          Add a model name and API key in AI settings to start a discussion.
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
          accessibilityLabel="Discussion"
        >
          <View style={styles.column}>
            {notice}
            {!chat.settingsLoaded ? (
              <ThinkingRow label="Loading discussion…" />
            ) : (
              <>
                {!started && !chat.pending ? (
                  <EmptyHint
                    icon={MessagesSquare}
                    title="No discussion yet"
                    hint="Type a belief or opinion in the message box."
                  />
                ) : (
                  chat.messages.map((message, index) => (
                    <View
                      key={`${index}-${message.role}-${message.kind ?? "turn"}`}
                      onLayout={
                        message.role === "user" ? (event) => anchorUserMessage(index, event.nativeEvent.layout.y) : undefined
                      }
                    >
                      <ChatBubble
                        message={message}
                        onRegenerate={
                          message.stopped && index === chat.messages.length - 1 && !chat.pending
                            ? () => void chat.regenerate()
                            : undefined
                        }
                      />
                    </View>
                  ))
                )}

                {chat.pending && <ThinkingRow label="Thinking" />}

                {chat.canWrapUp && (
                  <ActionButton
                    label={chat.synthesisPending ? "Summarising…" : "Wrap up both sides"}
                    icon={ListChecks}
                    variant="outline"
                    loading={chat.synthesisPending}
                    onPress={() => void chat.wrapUp()}
                  />
                )}
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
      </View>

      <View style={styles.footer}>
        <View style={styles.footerColumn}>
          <ChatComposer
            value={chat.draft}
            placeholder={started ? "Reply, or push back on a point…" : "State a belief or opinion…"}
            pending={chat.pending}
            error={chat.error}
            onChangeText={chat.setDraft}
            onSend={() => void chat.send()}
            onStop={chat.stop}
          />
        </View>
      </View>
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
  },
  noticeTitle: {
    ...typeScale.title,
  },
  noticeText: {
    ...typeScale.body,
  },
});
