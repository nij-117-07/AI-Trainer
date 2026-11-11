// src/features/tutor-chat/components/TutorChatScreen.tsx
/**
 * Tutor Chat. With no session open, the body lists saved sessions and the footer starts a new one.
 * With a session open, the body holds the conversation and the footer holds the message box.
 */
import { useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { spacing, useThemeColors } from "@/theme";
import { ErrorText } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useTutorChat } from "../hooks/useTutorChat";
import type { TutorSettingsValues } from "../lib/types";
import { ChatFooter, ChatWorkspace } from "./ChatWorkspace";
import { CreateSessionForm } from "./CreateSessionForm";
import { SessionList } from "./SessionList";

const EMPTY: TutorSettingsValues = { masterTopic: "", additionalContext: "" };
const CREATE_FORM_KEY = "learning.tutor-chat.create-session.v1";

export function TutorChatScreen() {
  const colors = useThemeColors();
  const chat = useTutorChat();
  const [createForm, setCreateForm] = usePersistedState<TutorSettingsValues>(CREATE_FORM_KEY, EMPTY);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const listView = chat.loaded && !chat.active;

  async function startChat() {
    setCreateError(null);
    setCreating(true);
    try {
      await chat.createNewSession(createForm);
      setCreateForm(EMPTY);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create the session.");
    } finally {
      setCreating(false);
    }
  }

  function updateCreateForm(patch: Partial<TutorSettingsValues>) {
    setCreateForm((prev) => ({ ...prev, ...patch }));
  }

  let footer: ReactNode = null;
  if (chat.loaded) {
    footer = chat.active ? (
      <ChatFooter chat={chat} />
    ) : (
      <CreateSessionForm
        form={createForm}
        onChange={updateCreateForm}
        onSubmit={() => void startChat()}
        creating={creating}
        error={createError}
      />
    );
  }

  let body: ReactNode;
  if (!chat.loaded) {
    body = (
      <View style={styles.loading}>
        {chat.loadError ? (
          <ErrorText message={chat.loadError} />
        ) : (
          <>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading sessions…</Text>
          </>
        )}
      </View>
    );
  } else if (chat.active) {
    body = <ChatWorkspace chat={chat} />;
  } else {
    body = <SessionList sessions={chat.sessions} onOpen={chat.openSession} onDelete={chat.deleteSession} />;
  }

  return (
    <ToolScreen
      title="Tutor Chat"
      headerRight={listView ? <ResetButton onPress={() => setCreateForm(EMPTY)} /> : undefined}
      footer={footer}
      footerSide={false}
    >
      {body}
    </ToolScreen>
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
});
