// src/features/roleplay-chatbot/components/RoleplayChatTab.tsx
/**
 * Roleplay chat: define a character with a persona, then talk to it turn by turn. Each reply
 * comes with an emotion tag and an action. The transcript lives in memory only and is cleared
 * when the screen is left or reset.
 */
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Drama, Eraser, Loader2, MessagesSquare, RefreshCcw, Send } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ListenButton } from "@/components/tool/ListenButton";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useRequest } from "@/hooks/useRequest";
import { usePersistedState } from "@/hooks/usePersistedState";
import { sendTurn } from "../lib/generators";
import type { ChatMessage } from "../types";

const DEFAULT_CHARACTER = "Elara";
const DEFAULT_PERSONA =
  "You are Elara Nightwhisper, a mysterious elven mage from the ancient forest of Thalendril. You are over 800 years old but appear as a young woman with silver hair and violet eyes. You speak in a slightly formal, archaic manner and use metaphors related to nature, stars, and time.";

const STORAGE_KEY = "learning.roleplay-chatbot.setup.v1";

export function RoleplayChatTab() {
  const colors = useThemeColors();
  const { settings } = useAiSettings();
  const [characterName, setCharacterName] = usePersistedState(`${STORAGE_KEY}.character`, DEFAULT_CHARACTER);
  const [persona, setPersona] = usePersistedState(`${STORAGE_KEY}.persona`, DEFAULT_PERSONA);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const request = useRequest(sendTurn);

  async function send() {
    const text = draft.trim();
    if (!text || request.pending) return;
    const history = messages;
    setMessages([...history, { role: "user", content: text }]);
    setDraft("");
    const reply = await request.run(settings, {
      systemPrompt: persona,
      characterName,
      history,
      userInput: text,
    });
    if (reply) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply.response, emotion: reply.emotion, action: reply.action },
      ]);
    } else {
      setMessages(history);
      setDraft(text);
    }
  }

  function clearConversation() {
    setMessages([]);
    setDraft("");
    request.reset();
  }

  function reset() {
    setCharacterName(DEFAULT_CHARACTER);
    setPersona(DEFAULT_PERSONA);
    clearConversation();
  }

  const speaker = characterName.trim() || "Character";

  return (
    <Section>
      <Panel>
        <SectionTitle icon={Drama} title="Character" />
        <TextField
          label="Character name"
          placeholder="e.g. Elara"
          value={characterName}
          onChangeText={setCharacterName}
          editable={!request.pending}
          maxLength={60}
        />
        <TextField
          label="Persona"
          hint="Personality, backstory, speech style, and rules the character follows."
          placeholder="Describe who your character is"
          value={persona}
          onChangeText={setPersona}
          editable={!request.pending}
          multiline
          maxLength={4000}
          voice
        />
      </Panel>

      <Panel>
        <SectionTitle icon={MessagesSquare} title="Conversation" />
        {messages.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Say something to start the scene.
          </Text>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} speaker={speaker} />
          ))
        )}
        {request.pending && (
          <View style={styles.typingRow}>
            <Loader2 size={14} color={colors.primary} />
            <Text style={[styles.typingText, { color: colors.mutedForeground }]}>{speaker} is responding…</Text>
          </View>
        )}
      </Panel>

      <ErrorText message={request.error} />

      <Panel>
        <TextField
          label="Your message"
          placeholder="Say something to your character"
          value={draft}
          onChangeText={setDraft}
          editable={!request.pending}
          multiline
          maxLength={2000}
          voice
        />
        <ActionButton
          label={request.pending ? "Waiting for reply…" : "Send"}
          icon={Send}
          loading={request.pending}
          onPress={send}
        />
      </Panel>

      <ActionButton label="New conversation" icon={Eraser} variant="outline" onPress={clearConversation} />
      <ActionButton label="Reset" icon={RefreshCcw} variant="outline" onPress={reset} />
    </Section>
  );
}

function MessageBubble({ message, speaker }: { message: ChatMessage; speaker: string }) {
  const colors = useThemeColors();
  const mine = message.role === "user";
  const meta = [message.emotion, message.action].filter(Boolean).join(" · ");

  return (
    <View style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.speaker, { color: mine ? colors.primaryForeground : colors.mutedForeground }]}>
          {mine ? "You" : speaker}
        </Text>
        {mine ? (
          <Text selectable style={[styles.plainText, { color: colors.primaryForeground }]}>
            {message.content}
          </Text>
        ) : (
          <>
            <MarkdownText content={message.content} />
            <ListenButton text={message.content} label="Reply" />
          </>
        )}
        {!mine && meta ? <Text style={[styles.meta, { color: colors.mutedForeground }]}>{meta}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  typingText: {
    fontSize: 13,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowMine: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "85%",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: radius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },
  speaker: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  plainText: {
    fontSize: 15,
    lineHeight: 23,
  },
  meta: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
