// src/app/tools/tasks/index.tsx
import { useState, type ReactNode } from "react";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ManageLists } from "@/features/tasks/components/ManageLists";
import { TaskComposer } from "@/features/tasks/components/TaskComposer";
import { TaskEditor } from "@/features/tasks/components/TaskEditor";
import { TasksTool } from "@/features/tasks/components/TasksTool";
import { useReminderSync } from "@/features/tasks/hooks/useReminderSync";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { dateKey } from "@/features/tasks/lib/dates";

export default function TasksRoute() {
  const store = useTasks();
  useReminderSync(store.tasks, store.loaded);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [managing, setManaging] = useState(false);
  const selected = store.tasks.find((task) => task.id === selectedId) ?? null;
  const today = dateKey(new Date());

  let body: ReactNode;
  if (managing) {
    body = <ManageLists store={store} onBack={() => setManaging(false)} />;
  } else if (selected) {
    body = (
      <TaskEditor
        key={selected.id}
        task={selected}
        projects={store.projects}
        labels={store.labels}
        today={today}
        onBack={() => setSelectedId(null)}
        onSave={(patch) => store.updateTask(selected.id, patch)}
        onToggle={() => store.toggleTask(selected.id)}
        onDelete={() => {
          store.removeTask(selected.id);
          setSelectedId(null);
        }}
      />
    );
  } else {
    body = <TasksTool store={store} today={today} onOpen={setSelectedId} onManage={() => setManaging(true)} />;
  }

  const browsing = !managing && !selected;

  return (
    <ToolScreen title="Task Manager" wide={!selected} footer={browsing ? <TaskComposer store={store} /> : null}>
      {body}
    </ToolScreen>
  );
}
