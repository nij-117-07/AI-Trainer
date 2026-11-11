// src/features/tutor-chat/components/ChatWorkspace.tsx
/**
 * The open session. The body holds the session settings (collapsed by default) and the
 * conversation, with each tutor reply's key concepts under it. The footer holds the message box.
 */
import { useEffect, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GraduationCap, MessagesSquare, RotateCcw } from "lucide-react-native";
import { shape, spacing, typeScale, useThemeColors } from "@/theme";
import { ActionButton, ErrorText, TextField } from "@/components/tool/FormControls";
import { CopyButton } from "@/components/tool/CopyButton";
import { Disclosure } from "@/components/tool/Disclosure";
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
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
} as const;

export function ChatWorkspace({ chat }: ChatWorkspaceProps) {
  const colors = useThemeColors();
  const scroll = useToolScroll();
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

  return (
    <Section>
      <Disclosure title="Session settings" summary={settings.additionalContext || "No background added"}>
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
        <Text accessibilityLiveRegion="polite" style={[styles.status, { color: colors.mutedForeground }]}>
          {STATUS_TEXT[chat.settingsStatus]}
        </Text>
        <ErrorText message={chat.settingsError} />
      </Disclosure>

      {rows.length === 0 && !pending ? (
        <EmptyHint
          icon={MessagesSquare}
          title="Ask your first question"
          hint="The tutor replies with an answer and the key concepts."
        />
      ) : null}

      <View accessibilityRole="log" accessibilityLabel="Conversation" style={styles.log}>
        {rows.map(({ message, concepts }, index) => (
          <MessageItem key={index} message={message} concepts={concepts} />
        ))}
        {pending ? <ThinkingReply /> : null}
      </View>
    </Section>
  );
}

export function ChatFooter({ chat }: { chat: TutorChatState }) {
  return (
    <View style={styles.footer}>
      {chat.turnError ? (
        <>
          <ErrorText message={chat.turnError} />
          <ActionButton label="Retry" icon={RotateCcw} variant="outline" onPress={() => void chat.sendTurn()} />
        </>
      ) : null}
      <ChatComposer
        value={chat.draft}
        onChangeText={chat.setDraft}
        onSend={() => {
          void chat.sendTurn();
        }}
        pending={chat.pending}
        placeholder="Ask a question…"
      />
    </View>
  );
}

function MessageItem({ message, concepts }: { message: ChatMessage; concepts: ConceptItem[] | null }) {
  const colors = useThemeColors();

  if (message.role === "user") {
    return (
      <Text
        selectable
        accessibilityLabel={`You: ${message.content}`}
        style={[styles.userText, { color: colors.foreground, backgroundColor: colors.tone.sky.bg, borderColor: colors.tone.sky.border }]}
      >
        {message.content}
      </Text>
    );
  }

  return (
    <TutorReply>
      <MarkdownText content={message.content} />
      <View style={styles.actions}>
        <CopyButton text={message.content} label="Copy reply" />
        <ListenButton text={message.content} label="Reply" />
      </View>
      {concepts && concepts.length > 0 ? (
        <ErrorBoundary label="Key concepts">
          <ReplyConcepts items={concepts} />
        </ErrorBoundary>
      ) : null}
    </TutorReply>
  );
}

function ThinkingReply() {
  const colors = useThemeColors();
  return (
    <TutorReply>
      <Text accessibilityLiveRegion="polite" style={[styles.thinking, { color: colors.mutedForeground }]}>
        Thinking…
      </Text>
    </TutorReply>
  );
}

function TutorReply({ children }: { children: ReactNode }) {
  const colors = useThemeColors();
  return (
    <View style={styles.reply}>
      <View style={[styles.avatar, { backgroundColor: colors.tone.sky.bg }]}>
        <GraduationCap size={18} color={colors.tone.sky.fg} />
      </View>
      <View style={styles.replyBody}>
        <Text style={[styles.speaker, { color: colors.mutedForeground }]}>Tutor</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    ...typeScale.caption,
  },
  log: {
    gap: spacing.lg,
  },
  userText: {
    ...typeScale.body,
    alignSelf: "flex-end",
    maxWidth: "80%",
    borderWidth: 1,
    borderRadius: shape.lg,
    borderTopRightRadius: shape.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  reply: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  replyBody: {
    flex: 1,
    gap: spacing.sm,
  },
  speaker: {
    ...typeScale.caption,
  },
  thinking: {
    ...typeScale.body,
  },
  actions: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  footer: {
    gap: spacing.sm,
  },
});
