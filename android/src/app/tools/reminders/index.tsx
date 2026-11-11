// src/app/tools/reminders/index.tsx
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { ActionButton } from "@/components/tool/FormControls";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { RemindersList } from "@/features/reminders/components/RemindersList";
import { useReminders } from "@/features/reminders/hooks/useReminders";

export default function RemindersRoute() {
  const router = useRouter();
  const store = useReminders();

  return (
    <ToolScreen
      title="Reminders"
      usesAi={false}
      wide
      footerSide={false}
      footer={
        store.loaded ? <ActionButton label="New reminder" icon={Plus} onPress={() => router.push("/tools/reminders/new")} /> : null
      }
    >
      <RemindersList store={store} />
    </ToolScreen>
  );
}
