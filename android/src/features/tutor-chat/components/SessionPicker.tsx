// src/features/tutor-chat/components/SessionPicker.tsx
/** First screen of the Tutor Chat: start a new session or open a saved one. */
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { MessagesSquare } from "lucide-react-native";
import { useThemeColors } from "@/theme";
import { ErrorText, Panel } from "@/components/tool/FormControls";
import { Section } from "@/components/tool/Section";
import { SectionTitle } from "@/components/tool/SectionTitle";
import type { TutorChatSession, TutorSettingsValues } from "../lib/types";
import { CreateSessionForm } from "./CreateSessionForm";
import { SessionCard } from "./SessionCard";

interface SessionPickerProps {
  sessions: TutorChatSession[];
  onOpen: (id: string) => void;
  onCreate: (values: TutorSettingsValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SessionPicker({ sessions, onOpen, onCreate, onDelete }: SessionPickerProps) {
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
        A topic-scoped tutor that keeps your context and previous turns in mind, replying with a
        personalized explanation and a concept breakdown each time.
      </Text>

      <CreateSessionForm onCreate={onCreate} />

      <SectionTitle icon={MessagesSquare} title="Saved sessions" />
      <ErrorText message={listError} />

      {sessions.length === 0 ? (
        <Panel>
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>
            No sessions yet. Create your first session above, then ask your first question.
          </Text>
        </Panel>
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
  empty: {
    fontSize: 14,
    lineHeight: 21,
  },
});
