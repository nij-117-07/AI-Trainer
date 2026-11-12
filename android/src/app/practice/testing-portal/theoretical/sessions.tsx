// src/app/practice/testing-portal/theoretical/sessions.tsx
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { spacing } from "@/theme";
import { ActionButton, ErrorText } from "@/components/tool/FormControls";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { PortalLoading } from "@/features/testing-portal/components/PortalLoading";
import { PortalSessionList } from "@/features/testing-portal/components/PortalSessionList";
import { useTheoreticalSessions } from "@/features/testing-portal/hooks/useTheoreticalSessions";

export default function TheoreticalSessionsRoute() {
  const router = useRouter();
  const sessions = useTheoreticalSessions();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function startSession() {
    setCreateError(null);
    setCreating(true);
    try {
      await sessions.create();
      router.replace("/practice/testing-portal/theoretical/new");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : "Could not create the session.");
    } finally {
      setCreating(false);
    }
  }

  async function openSession(id: string) {
    await sessions.open(id);
    router.back();
  }

  return (
    <ToolScreen
      title="Sessions"
      footer={
        <View style={styles.footer}>
          <ErrorText message={createError} />
          <ActionButton label="New session" icon={Plus} loading={creating} onPress={() => void startSession()} />
        </View>
      }
    >
      {sessions.loaded ? (
        <PortalSessionList
          sessions={sessions.sessions}
          activeId={sessions.activeId}
          onOpen={openSession}
          onDelete={sessions.remove}
        />
      ) : (
        <PortalLoading />
      )}
    </ToolScreen>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
});
