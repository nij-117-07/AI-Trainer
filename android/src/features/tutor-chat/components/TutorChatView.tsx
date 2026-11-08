// src/features/tutor-chat/components/TutorChatView.tsx
/** Tutor Chat body: the session picker when no session is open, otherwise the chat workspace. */
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { spacing, useThemeColors } from "@/theme";
import { ErrorText } from "@/components/tool/FormControls";
import { useTutorChat } from "../hooks/useTutorChat";
import { SessionPicker } from "./SessionPicker";
import { ChatWorkspace } from "./ChatWorkspace";

export function TutorChatView() {
  const chat = useTutorChat();
  const colors = useThemeColors();

  if (!chat.loaded) {
    return (
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
  }

  if (!chat.active) {
    return (
      <SessionPicker
        sessions={chat.sessions}
        onOpen={chat.openSession}
        onCreate={chat.createNewSession}
        onDelete={chat.deleteSession}
      />
    );
  }

  return <ChatWorkspace chat={chat} />;
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
