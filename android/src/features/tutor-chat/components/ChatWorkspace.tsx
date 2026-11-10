// src/features/tutor-chat/components/ChatWorkspace.tsx
/**
 * The open session. The body holds the session settings (collapsed by default) and the
 * conversation, with each tutor reply's key concepts under it. The footer holds the message box.
 */
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, ChevronUp, ListRestart, MessagesSquare, Trash2 } from "lucide-react-native";
import { radius, spacing, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, Panel, TextField } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ErrorBoundary } from "@/components/tool/ErrorBoundary";
import { ListenButton } from "@/components/tool/ListenButton";
import { MarkdownText } from "@/components/tool/MarkdownText";
import { Section } from "@/components/tool/Section";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { TutorChatState } from "../hooks/useTutorChat";
import { withReplyConcepts } from "../lib/session-model";
import type { ChatMessage, ConceptItem } from "../lib/types";
import { ChatComposer } from "./ChatComposer";
import { ReplyConcepts } from "./ReplyConcepts";

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
  const scroll = useToolScroll();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { active, pending } = chat;
  const messageCount = active?.chatHistory.length ?? 0;

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [messageCount, pending, scroll]);

  if (!active) return null;

  const settings = chat.settingsDraft ?? {
    masterTopic: active.masterTopic,
    additionalContext: active.additionalContext,
  };
  const rows = withReplyConcepts(active.chatHistory, active.breakdowns);
  const sessionId = active.id;

  function confirmDelete() {
    Alert.alert(
      "Delete this session?",
      `"${settings.masterTopic || "This session"}" and its chat history will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            chat.deleteSession(sessionId).catch((error: unknown) => {
              Alert.alert("Could not delete", error instanceof Error ? error.message : "Please try again.");
            });
          },
        },
      ],
    );
  }

  return (
    <Section>
      <ActionButton label="All sessions" icon={ListRestart} variant="outline" onPress={chat.closeSession} />

      <Panel>
        <Pressable
          onPress={() => setSettingsOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: settingsOpen }}
          accessibilityLabel="Session settings"
          style={styles.settingsHead}
        >
          <View style={styles.settingsText}>
            <Text style={[styles.settingsLabel, { color: colors.mutedForeground }]}>Topic</Text>
            <Text style={[styles.settingsTopic, { color: colors.foreground }]} numberOfLines={1}>
              {settings.masterTopic || "Untitled session"}
            </Text>
          </View>
          {settingsOpen ? (
            <ChevronUp size={18} color={colors.mutedForeground} />
          ) : (
            <ChevronDown size={18} color={colors.mutedForeground} />
          )}
        </Pressable>

        {settingsOpen ? (
          <>
            <TextField
              label="Master topic"
              placeholder="e.g. Quantum physics"
              value={settings.masterTopic}
              onChangeText={(text) => chat.updateSettingsDraft({ masterTopic: text })}
              editable={!pending}
              maxLength={300}
            />
            <TextField
              label="Your background (optional)"
              placeholder="Background, goals, or learning style…"
              value={settings.additionalContext}
              onChangeText={(text) => chat.updateSettingsDraft({ additionalContext: text })}
              editable={!pending}
              maxLength={2000}
              multiline
              voice
            />
            <Text style={[styles.status, { color: colors.mutedForeground }]}>{STATUS_TEXT[chat.settingsStatus]}</Text>
            <ErrorText message={chat.settingsError} />
            <ActionButton label="Delete session" icon={Trash2} variant="outline" disabled={pending} onPress={confirmDelete} />
          </>
        ) : null}
      </Panel>

      {rows.length === 0 && !pending ? (
        <EmptyHint
          icon={MessagesSquare}
          title="Start the conversation"
          hint="Ask a question in the box below. The tutor replies with an explanation and the key concepts."
        />
      ) : null}

      {rows.map(({ message, concepts }, index) => (
        <MessageBubble key={index} message={message} concepts={concepts} />
      ))}
      {pending ? <ThinkingBubble /> : null}
    </Section>
  );
}

export function ChatFooter({ chat }: { chat: TutorChatState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={chat.turnError} />
      <ChatComposer
        value={chat.draft}
        onChangeText={chat.setDraft}
        onSend={() => {
          void chat.sendTurn();
        }}
        pending={chat.pending}
        placeholder="Ask a question about your topic…"
      />
    </View>
  );
}

function MessageBubble({ message, concepts }: { message: ChatMessage; concepts: ConceptItem[] | null }) {
  const colors = useThemeColors();
  const isUser = message.role === "user";
  return (
    <View style={[styles.column, isUser ? styles.columnEnd : styles.columnStart]}>
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
          <>
            <MarkdownText content={message.content} />
            <ListenButton text={message.content} label="Reply" />
          </>
        )}
      </View>
      {!isUser && concepts && concepts.length > 0 ? (
        <View style={styles.concepts}>
          <ErrorBoundary label="Key concepts">
            <ReplyConcepts items={concepts} />
          </ErrorBoundary>
        </View>
      ) : null}
    </View>
  );
}

function ThinkingBubble() {
  const colors = useThemeColors();
  return (
    <View style={[styles.column, styles.columnStart]}>
      <View style={[styles.bubble, { backgroundColor: colors.muted }]}>
        <Text style={[styles.thinking, { color: colors.mutedForeground }]}>Tutor is thinking…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
  },
  settingsText: {
    flex: 1,
    gap: spacing.xs,
  },
  settingsLabel: {
    fontSize: 12,
  },
  settingsTopic: {
    fontSize: 16,
    fontWeight: "600",
  },
  status: {
    fontSize: 13,
  },
  column: {
    gap: spacing.sm,
  },
  columnEnd: {
    alignItems: "flex-end",
  },
  columnStart: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  concepts: {
    width: "88%",
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
  },
  thinking: {
    fontSize: 14,
    fontStyle: "italic",
  },
  footer: {
    gap: spacing.sm,
  },
});
