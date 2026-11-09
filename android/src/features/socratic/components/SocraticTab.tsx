// src/features/socratic/components/SocraticTab.tsx
/**
 * Socratic Challenger body. Before a discussion starts, the setup form picks the focus and
 * confidence. After that, the chat runs in a scroll box, and the composer is in the screen footer
 * (see the route). Wrap-up closes the discussion with both sides and a refined position.
 */
import { StyleSheet, Text } from "react-native";
import { ListChecks } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActionButton, Panel } from "@/components/tool/FormControls";
import { ScrollPanel } from "@/components/tool/ScrollPanel";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { CONFIDENCE_OPTIONS, FOCUS_OPTIONS } from "../options";
import type { SocraticFocus } from "../types";
import type { useSocraticChat } from "../hooks/useSocraticChat";
import { ChatBubble } from "./ChatBubble";
import { ThinkingRow } from "./ThinkingRow";

interface SocraticTabProps {
  chat: ReturnType<typeof useSocraticChat>;
}

export function SocraticTab({ chat }: SocraticTabProps) {
  const colors = useThemeColors();
  const started = chat.messages.length > 0;
  const focusOption = FOCUS_OPTIONS.find((option) => option.value === chat.focus);
  const confidenceOption = CONFIDENCE_OPTIONS.find((option) => option.value === chat.confidence);

  return (
    <Section>
      {started ? (
        <Text style={[styles.summaryLine, { color: colors.mutedForeground }]}>
          {focusOption?.label} · Confidence: {confidenceOption?.label}
        </Text>
      ) : (
        <Panel>
          <SelectField
            label="What should the challenger do?"
            options={FOCUS_OPTIONS}
            value={chat.focus}
            onChange={(value) => chat.setFocus(value as SocraticFocus)}
            allowCustom={false}
          />
          {focusOption?.hint && <Text style={[styles.hint, { color: colors.mutedForeground }]}>{focusOption.hint}</Text>}
          <SelectField
            label="Your confidence"
            options={CONFIDENCE_OPTIONS}
            value={chat.confidence}
            onChange={chat.setConfidence}
            allowCustom={false}
          />
        </Panel>
      )}

      <ScrollPanel scrollKey={chat.messages.length + (chat.pending ? 1 : 0)}>
        {!started && (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            No discussion yet. State a belief or opinion, and the challenger will test it from both sides and ask you the
            question that matters most.
          </Text>
        )}
        {chat.messages.map((message, index) => (
          <ChatBubble key={`${index}-${message.role}-${message.kind ?? "turn"}`} message={message} />
        ))}
        {chat.challengePending && <ThinkingRow label="Challenging your reasoning…" />}
        {chat.synthesisPending && <ThinkingRow label="Weighing both sides…" />}
      </ScrollPanel>

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
  summaryLine: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: spacing.xs,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
});
