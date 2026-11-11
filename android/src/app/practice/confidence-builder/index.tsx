// src/app/practice/confidence-builder/index.tsx
import { useEffect, useState } from "react";
import { View } from "react-native";
import { ChoiceChips } from "@/components/tool/FormControls";
import { ResetButton } from "@/components/tool/ResetButton";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { spacing } from "@/theme";
import { ConfidenceFormBody, ConfidenceFormFooter } from "@/features/confidence-builder/components/ConfidenceForm";
import { ActiveRoundBody, ActiveRoundFooter } from "@/features/confidence-builder/components/ActiveRound";
import { EditFormButton, TaskPicker, TaskPickerFooter } from "@/features/confidence-builder/components/TaskPicker";
import { HistoryPanel } from "@/features/confidence-builder/components/HistoryPanel";
import { useConfidenceBuilder } from "@/features/confidence-builder/hooks/useConfidenceBuilder";

type Tab = "tasks" | "history";

const TABS = [
  { value: "tasks" as const, label: "Tasks" },
  { value: "history" as const, label: "History" },
];

export default function ConfidenceBuilderRoute() {
  const state = useConfidenceBuilder();
  const { tasks, active } = state;
  const [tab, setTab] = useState<Tab>("tasks");
  const [editing, setEditing] = useState(false);
  const shown = tasks && !editing ? tasks : null;

  useEffect(() => {
    setEditing(false);
  }, [tasks]);

  const tasksTab = tab === "tasks";

  return (
    <ToolScreen
      title="Confidence Builder"
      headerRight={
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          {tasksTab && shown && !active ? <EditFormButton onPress={() => setEditing(true)} /> : null}
          <ResetButton onPress={state.reset} accessibilityLabel="Reset form and tasks" />
        </View>
      }
      footer={
        !tasksTab ? undefined : active ? (
          <ActiveRoundFooter state={state} round={active} />
        ) : shown ? (
          <TaskPickerFooter state={state} />
        ) : (
          <ConfidenceFormFooter state={state} onBack={tasks ? () => setEditing(false) : undefined} />
        )
      }
    >
      <View style={{ gap: spacing.lg }}>
        <ChoiceChips options={TABS} value={tab} onChange={setTab} />

        {!tasksTab ? (
          <HistoryPanel entries={state.entries} summary={state.summary} />
        ) : active ? (
          <ActiveRoundBody state={state} round={active} />
        ) : shown ? (
          <TaskPicker result={shown} onStart={state.startTask} />
        ) : (
          <ConfidenceFormBody state={state} />
        )}
      </View>
    </ToolScreen>
  );
}
