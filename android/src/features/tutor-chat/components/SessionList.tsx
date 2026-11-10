// src/features/tutor-chat/components/SessionList.tsx
/** Saved tutor chat sessions. Tap one to continue it, or start a new one from the footer. */
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { MessagesSquare } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ErrorText } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { TutorChatSession } from "../lib/types";
import { SessionCard } from "./SessionCard";

interface SessionListProps {
  sessions: TutorChatSession[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export function SessionList({ sessions, onOpen, onDelete }: SessionListProps) {
  const colors = useThemeColors();
  const [listError, setListError] = useState<string | null>(null);

  function confirmDelete(session: TutorChatSession) {
    Alert.alert(
      "Delete this session?",
      `"${session.masterTopic}" and its entire chat history will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setListError(null);
            onDelete(session.id).catch((error: unknown) => {
              setListError(error instanceof Error ? error.message : "Failed to delete session.");
            });
          },
        },
      ],
    );
  }

  return (
    <Section>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        Pick a saved session to carry on, or start a new one from the form below.
      </Text>

      <SectionTitle icon={MessagesSquare} title="Saved sessions" />
      <ErrorText message={listError} />

      {sessions.length === 0 ? (
        <EmptyHint
          icon={MessagesSquare}
          title="No sessions yet"
          hint="Enter a master topic in the form below and tap Start chatting."
        />
      ) : (
        sessions.map((session) => (
          <SessionCard key={session.id} session={session} onOpen={onOpen} onDelete={confirmDelete} />
        ))
      )}
    </Section>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    lineHeight: 21,
  },
});
