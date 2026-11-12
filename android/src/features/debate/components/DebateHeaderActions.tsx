// src/features/debate/components/DebateHeaderActions.tsx
/** Header controls for the debate: Get verdict while the debate is open, and Reset. */
import { Pressable, StyleSheet } from "react-native";
import { Gavel } from "lucide-react-native";
import { shape, touchTarget, useThemeColors } from "@/theme";
import { confirmAction } from "@/features/chatbot/lib/confirm";
import { pointerCursor } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import type { DebateSessionState } from "../hooks/useDebateSession";
import type { DebateSession } from "../types";

export function DebateHeaderActions({ game, session }: { game: DebateSessionState; session: DebateSession }) {
  const colors = useThemeColors();
  const canJudge = !session.complete && session.history.length > 0 && !game.busy;

  function confirmJudge() {
    confirmAction(
      "End the debate?",
      "The judge scores the statements so far. You can't add more statements after the verdict.",
      () => void game.endAndJudge(),
      "Get verdict",
    );
  }

  function confirmReset() {
    confirmAction(
      "Reset this debate?",
      "The transcript, personas, and verdict will be cleared. This can't be undone.",
      game.resetDebate,
      "Reset",
    );
  }

  return (
    <>
      {!session.complete && (
        <Pressable
          onPress={confirmJudge}
          disabled={!canJudge}
          accessibilityRole="button"
          accessibilityLabel="Get verdict"
          accessibilityState={{ disabled: !canJudge }}
          style={({ pressed }) => [
            styles.button,
            pointerCursor,
            { borderColor: colors.border, opacity: canJudge ? 1 : 0.4 },
            pressed && canJudge && { backgroundColor: colors.muted },
          ]}
        >
          <Gavel size={20} color={colors.foreground} />
        </Pressable>
      )}
      <ResetButton accessibilityLabel="Reset debate" onPress={confirmReset} />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: shape.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
