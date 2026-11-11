// src/features/roleplay/components/RoleplayChatView.tsx
/**
 * Roleplay chat. The body shows the current persona and the transcript; the footer holds the
 * error and the message composer. The persona is written on the Persona page.
 */
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Drama, Loader2, MessagesSquare, UserCog } from "lucide-react-native";
import { spacing, useThemeColors } from "@/theme";
import { ActiveLanguageNotice } from "@/features/language-profiles/components/ActiveLanguageNotice";
import { ActionButton, ErrorText, Panel } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import { useToolScroll } from "@/components/tool/ToolScrollContext";
import type { RoleplayChatState } from "../hooks/useRoleplayChat";
import { MessageBubble } from "./MessageBubble";
import { RoleplayComposer } from "./RoleplayComposer";

export function RoleplayChatBody({ chat }: { chat: RoleplayChatState }) {
  const colors = useThemeColors();
  const router = useRouter();
  const scroll = useToolScroll();
  const { settings, history, pending, loaded, error } = chat;
  const hasPersona = settings.systemPrompt.trim() !== "";

  useEffect(() => {
    scroll?.current?.scrollToEnd({ animated: true });
  }, [history.length, pending, scroll]);

  if (!loaded) {
    return (
      <View style={styles.loading}>
        {error ? (
          <ErrorText message={error} />
        ) : (
          <>
            <ActivityIndicator color={colors.primary} />
            <Text accessibilityLiveRegion="polite" style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Loading conversation…
            </Text>
          </>
        )}
      </View>
    );
  }

  return (
    <Section>
      <ActiveLanguageNotice />

      <Panel>
        <SectionTitle icon={Drama} title="Persona" />
        <Text
          numberOfLines={4}
          style={[styles.persona, { color: hasPersona ? colors.foreground : colors.mutedForeground }]}
        >
          {hasPersona ? settings.systemPrompt : "No persona yet. Write one to start the scene."}
        </Text>
        <ActionButton
          label="Edit persona"
          icon={UserCog}
          variant="outline"
          onPress={() => router.push("/language-learner/roleplay/persona")}
        />
      </Panel>

      {history.length === 0 && !pending ? (
        <EmptyHint
          icon={MessagesSquare}
          title="No conversation yet"
          hint={
            hasPersona
              ? "Type a message to step into character."
              : "Write a persona first, then send your first message."
          }
        />
      ) : (
        history.map((message, index) => <MessageBubble key={index} message={message} speaker="Persona" />)
      )}

      <View accessibilityLiveRegion="polite" style={styles.typingRow}>
        {pending && (
          <>
            <Loader2 size={14} color={colors.primary} />
            <Text style={[styles.typingText, { color: colors.mutedForeground }]}>The persona is responding…</Text>
          </>
        )}
      </View>
    </Section>
  );
}

export function RoleplayChatFooter({ chat }: { chat: RoleplayChatState }) {
  return (
    <View style={styles.footer}>
      <ErrorText message={chat.error} />
      <RoleplayComposer value={chat.draft} onChangeText={chat.setDraft} onSend={chat.send} pending={chat.pending} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing["2xl"],
  },
  loadingText: {
    fontSize: 14,
  },
  persona: {
    fontSize: 15,
    lineHeight: 22,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  typingText: {
    fontSize: 13,
  },
  footer: {
    gap: spacing.md,
  },
});
