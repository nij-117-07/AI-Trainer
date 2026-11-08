// src/features/socratic/components/SocraticTab.tsx
/**
 * Socratic Challenger: state a belief and the challenger stress-tests it with a fallacy check, a
 * falsification question, an edge case, and a refined perspective. The conversation and the chosen
 * confidence are kept on the device between visits.
 */
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { MessageSquare, Send } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { SelectField } from "@/components/tool/SelectField";
import { Section } from "@/components/tool/Section";
import { useRequest } from "@/hooks/useRequest";
import { challengeStatement } from "../lib/generators";
import { CONFIDENCE_OPTIONS, DEFAULT_CONFIDENCE } from "../options";
import { sanitizeConfidence, sanitizeMessages } from "../lib/normalize";
import { formatChallenge, toHistory } from "../lib/transcript";
import { usePersistedDocument } from "../hooks/usePersistedDocument";
import type { ChatMessage } from "../types";
import { ChatBubble } from "./ChatBubble";

export const SOCRATIC_STORAGE_KEYS = {
  messages: "practice.socratic.messages.v1",
  confidence: "practice.socratic.confidence.v1",
} as const;

const STATEMENT_MAX = 2000;

export function SocraticTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const messages = usePersistedDocument<ChatMessage[]>(SOCRATIC_STORAGE_KEYS.messages, [], sanitizeMessages);
  const confidence = usePersistedDocument<string>(SOCRATIC_STORAGE_KEYS.confidence, DEFAULT_CONFIDENCE, sanitizeConfidence);
  const [statement, setStatement] = useState("");
  const challenge = useRequest(challengeStatement);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function startRequest(): AbortSignal {
    const controller = new AbortController();
    activeRequest.current = controller;
    return controller.signal;
  }

  async function handleSend() {
    const text = statement.trim();
    if (!text || challenge.pending) return;
    const next: ChatMessage[] = [...messages.value, { role: "user", content: text }];
    messages.setValue(next);
    setStatement("");
    const signal = startRequest();
    const result = await challenge.run(
      settings,
      { statement: text, history: toHistory(next), confidence: confidence.value },
      signal,
    );
    if (!result || signal.aborted) return;
    messages.setValue((current) => [...current, { role: "assistant", content: formatChallenge(result) }]);
  }

  function handleNewDiscussion() {
    messages.setValue([]);
    setStatement("");
    challenge.reset();
  }

  const empty = messages.value.length === 0 && !challenge.pending;

  return (
    <Section>
      <Panel>
        <SelectField
          label="Your confidence"
          options={CONFIDENCE_OPTIONS}
          value={confidence.value}
          onChange={(value) => confidence.setValue(value)}
          allowCustom={false}
        />
      </Panel>

      <Panel>
        {empty && (
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            No claims yet. State an opinion or belief and the challenger will interrogate it.
          </Text>
        )}
        {messages.value.map((message, index) => (
          <ChatBubble key={`${index}-${message.role}`} message={message} />
        ))}
        {challenge.pending && (
          <View style={styles.thinking}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.thinkingText, { color: colors.mutedForeground }]}>Challenging your reasoning…</Text>
          </View>
        )}
      </Panel>

      <Panel>
        <TextField
          label="Your claim or rebuttal"
          placeholder="State your claim or rebuttal…"
          value={statement}
          onChangeText={setStatement}
          editable={!challenge.pending}
          maxLength={STATEMENT_MAX}
          multiline
        />
        <ErrorText message={challenge.error} />
        <ActionButton
          label={challenge.pending ? "Challenging…" : "Send"}
          icon={Send}
          loading={challenge.pending}
          onPress={handleSend}
        />
      </Panel>

      <ActionButton
        label="Start a new discussion"
        icon={MessageSquare}
        variant="outline"
        loading={challenge.pending}
        onPress={handleNewDiscussion}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  thinking: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  thinkingText: {
    fontSize: 14,
  },
});
