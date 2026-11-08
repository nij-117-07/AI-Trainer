// src/features/tutor-chat/components/ChatWorkspace.tsx
/**
 * The open session: editable topic and context (autosaved), the message transcript, the
 * composer, and the concept breakdown for the selected reply.
 */
import { useRef } from "react";
import { ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from "react-native";
import { ListRestart, MessagesSquare } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { ErrorBoundary } from "@/components/tool/ErrorBoundary";
import type { TutorChatState } from "../hooks/useTutorChat";
import type { ChatMessage } from "../lib/types";
import { ChatComposer } from "./ChatComposer";
import { BreakdownPanel } from "./BreakdownPanel";

interface ChatWorkspaceProps {
  chat: TutorChatState;
}

const STATUS_TEXT = {
  idle: "Edits autosave",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
} as const;

export function ChatWorkspace({ chat }: ChatWorkspaceProps) {
  const colors = useThemeColors();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const { active, pending } = chat;

  if (!active) return null;

  const settings = chat.settingsDraft ?? {
    masterTopic: active.masterTopic,
    additionalContext: active.additionalContext,
  };

  return (
    <Section>
      <ActionButton label="All sessions" icon={ListRestart} variant="outline" onPress={chat.closeSession} />

      <Panel>
        <TextField
          label="Master topic"
          placeholder="e.g. Quantum Physics"
          value={settings.masterTopic}
          onChangeText={(text) => chat.updateSettingsDraft({ masterTopic: text })}
          editable={!pending}
          maxLength={300}
        />
        <TextField
          label="Your background & context"
          hint="Saved with your session and included with every turn."
          placeholder="Optional — background, goals, or learning style…"
          value={settings.additionalContext}
          onChangeText={(text) => chat.updateSettingsDraft({ additionalContext: text })}
          editable={!pending}
          maxLength={2000}
          multiline
        />
        <Text style={[styles.status, { color: colors.mutedForeground }]}>{STATUS_TEXT[chat.settingsStatus]}</Text>
        <ErrorText message={chat.settingsError} />
      </Panel>

      <Panel>
        <SectionTitle icon={MessagesSquare} title="Conversation" />
        <ScrollView
          ref={scrollRef}
          style={[styles.transcript, { borderColor: colors.border }]}
          contentContainerStyle={styles.transcriptContent}
          nestedScrollEnabled
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {active.chatHistory.length === 0 && !pending ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>
              Ask your first question and the tutor will reply with a personalized explanation and a
              concept breakdown.
            </Text>
          ) : null}
          {active.chatHistory.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {pending ? <ThinkingBubble /> : null}
        </ScrollView>
        <ErrorText message={chat.turnError} />
        <ChatComposer
          value={chat.draft}
          onChangeText={chat.setDraft}
          onSend={() => {
            void chat.sendTurn();
          }}
          pending={pending}
          placeholder="Ask a question about your topic…"
        />
      </Panel>

      <ErrorBoundary label="Concept breakdown">
        <BreakdownPanel
          items={chat.breakdown}
          index={chat.breakdownIndex}
          count={chat.breakdownCount}
          onNavigate={chat.goToBreakdown}
        />
      </ErrorBoundary>
    </Section>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const colors = useThemeColors();
  const isUser = message.role === "user";
  return (
    <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.primary, borderBottomRightRadius: radius.md }
            : { backgroundColor: colors.muted, borderBottomLeftRadius: radius.md },
        ]}
      >
        {isUser ? (
          <Text selectable style={[styles.userText, { color: colors.primaryForeground }]}>
            {message.content}
          </Text>
        ) : (
          <MarkdownText content={message.content} />
        )}
      </View>
    </View>
  );
}

function ThinkingBubble() {
  const colors = useThemeColors();
  return (
    <View style={[styles.row, styles.rowStart]}>
      <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
        <Text style={[styles.thinking, { color: colors.mutedForeground }]}>Tutor is thinking…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    fontSize: 13,
  },
  transcript: {
    maxHeight: 420,
    minHeight: 180,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  transcriptContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  empty: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: "row",
  },
  rowEnd: {
    justifyContent: "flex-end",
  },
  rowStart: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
  },
  thinking: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
