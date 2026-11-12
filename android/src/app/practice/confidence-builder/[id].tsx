// src/app/practice/confidence-builder/[id].tsx
import { Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { HeartHandshake, Trash2 } from "lucide-react-native";
import { typeScale, useThemeColors } from "@/theme";
import { ErrorText } from "@/components/tool/FormControls";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { HeaderAction } from "@/features/roadmap/components/HeaderAction";
import { TaskPicker, TaskPickerFooter } from "@/features/confidence-builder/components/TaskPicker";
import { useConfidenceSet } from "@/features/confidence-builder/hooks/useConfidenceSet";
import { focusLabelOf } from "@/features/confidence-builder/options";
import type { ConfidenceTask } from "@/features/confidence-builder/types";

export default function ConfidenceBuilderSetRoute() {
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const state = useConfidenceSet(String(id ?? ""));
  const { set, loaded, loadError, log } = state;
  const busy = log.active !== null || !log.loaded;

  function startTask(task: ConfidenceTask) {
    state.startTask(task);
    router.replace("/practice/confidence-builder" as never);
  }

  return (
    <ToolScreen
      title={set ? focusLabelOf(set.form.focus) : "Task set"}
      subtitle={set?.form.situation.trim() ? `Coming up: ${set.form.situation.trim()}` : undefined}
      headerRight={
        set ? (
          <HeaderAction
            icon={Trash2}
            label={`Delete ${focusLabelOf(set.form.focus)} tasks`}
            destructive
            onPress={() => state.remove(() => router.replace("/practice/confidence-builder" as never))}
          />
        ) : undefined
      }
      footer={set ? <TaskPickerFooter state={state} /> : undefined}
    >
      {set ? (
        <TaskPicker result={set.result} busy={busy} onStart={startTask} />
      ) : (
        <>
          <ErrorText message={loadError} />
          {!loaded ? <Text style={[typeScale.body, { color: colors.mutedForeground }]}>Loading these tasks…</Text> : null}
          {loaded && !loadError ? (
            <EmptyHint icon={HeartHandshake} title="Task set not found" hint="It may have been deleted." />
          ) : null}
        </>
      )}
    </ToolScreen>
  );
}
