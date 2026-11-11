// src/features/tutor-chat/components/TutorChatScreen.tsx
/**
 * Tutor Chat. With no session open, the body lists saved sessions and the footer starts a new one.
 * With a session open, the top bar shows its name and the body holds the conversation.
 */
import { useState, type ReactNode } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Plus, Trash2, type LucideIcon } from "lucide-react-native";
import { shape, spacing, touchTarget, useThemeColors } from "@/theme";
import { ErrorText, pointerCursor } from "@/components/tool/FormControls";
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
  const savedTopic = chat.settingsDraft?.masterTopic || chat.active?.masterTopic || "";

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

  function confirmDelete() {
    const sessionId = chat.active?.id;
    if (!sessionId) return;
    Alert.alert(
      "Delete this session?",
      `"${savedTopic || "This session"}" and its chat history will be permanently removed.`,
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

  let headerRight: ReactNode = undefined;
  if (listView) {
    headerRight = <ResetButton onPress={() => setCreateForm(EMPTY)} />;
  } else if (chat.active) {
    headerRight = (
      <>
        <HeaderIconButton icon={Plus} label="New chat" disabled={chat.pending} onPress={chat.closeSession} />
        <HeaderIconButton icon={Trash2} label="Delete session" disabled={chat.pending} onPress={confirmDelete} />
      </>
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
      title={chat.active ? savedTopic || "Untitled session" : "Tutor Chat"}
      headerRight={headerRight}
      footer={footer}
      footerSide={false}
    >
      {body}
    </ToolScreen>
  );
}

function HeaderIconButton({
  icon: Icon,
  label,
  disabled,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.headerButton,
        pointerCursor,
        pressed && { backgroundColor: colors.muted },
        disabled && styles.disabled,
      ]}
    >
      <Icon size={22} color={colors.foreground} />
    </Pressable>
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
  headerButton: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.4,
  },
});
