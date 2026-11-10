// src/features/socratic/components/SocraticChatView.tsx
/**
 * Socratic Challenger chat. The body shows the current focus and confidence, then the discussion.
 * The footer holds the error and the composer (see the route). Focus and confidence are set on the
 * settings page.
 */
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ListChecks, MessagesSquare, Scale, SlidersHorizontal } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import { CONFIDENCE_OPTIONS, FOCUS_OPTIONS } from "../options";
import type { SocraticChatState } from "../hooks/useSocraticChat";
import { ChatBubble } from "./ChatBubble";
import { ThinkingRow } from "./ThinkingRow";

export function SocraticChatView({ chat }: { chat: SocraticChatState }) {
  const colors = useThemeColors();
  const router = useRouter();
  const scroll = useToolScroll();
  const started = chat.messages.length > 0;
  const focusOption = FOCUS_OPTIONS.find((option) => option.value === chat.focus);
  const confidenceOption = CONFIDENCE_OPTIONS.find((option) => option.value === chat.confidence);

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [chat.messages.length, chat.pending, scroll]);

  if (!chat.settingsLoaded) return null;

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Scale} title="Discussion setup" />
        <View style={styles.summary}>
          <Text style={[styles.summaryValue, { color: colors.foreground }]}>{focusOption?.label}</Text>
          {focusOption?.hint && <Text style={[styles.hint, { color: colors.mutedForeground }]}>{focusOption.hint}</Text>}
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>Confidence: {confidenceOption?.label}</Text>
        </View>
        <ActionButton
          label="Edit settings"
          icon={SlidersHorizontal}
          variant="outline"
          onPress={() => router.push("/practice/socratic/settings")}
        />
      </Panel>

      {!started && !chat.pending ? (
        <EmptyHint
          icon={MessagesSquare}
          title="No discussion yet"
          hint="State a belief or opinion below. The challenger will test it from both sides and ask the question that matters most."
        />
      ) : (
        chat.messages.map((message, index) => (
          <ChatBubble key={`${index}-${message.role}-${message.kind ?? "turn"}`} message={message} />
        ))
      )}

      {chat.challengePending && <ThinkingRow label="Challenging your reasoning…" />}
      {chat.synthesisPending && <ThinkingRow label="Weighing both sides…" />}

      {chat.canWrapUp && (
        <ActionButton
          label={chat.synthesisPending ? "Summarising…" : "Wrap up both sides"}
          icon={ListChecks}
          variant="outline"
          loading={chat.synthesisPending}
          onPress={() => void chat.wrapUp()}
        />
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: spacing.xs,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
});
