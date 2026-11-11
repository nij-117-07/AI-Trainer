// src/app/tools/reminders/new.tsx
import { useRouter } from "expo-router";
import { ResetButton } from "@/components/tool/ResetButton";
import { Section } from "@/components/tool/Section";
import { ToolScreen } from "@/components/tool/ToolScreen";
import { ReminderFormFields, ReminderFormFooter } from "@/features/reminders/components/ReminderForm";
import { useReminderForm } from "@/features/reminders/hooks/useReminderForm";

export default function RemindersNewRoute() {
  const router = useRouter();
  const form = useReminderForm(() => router.back());

  return (
    <ToolScreen
      title="New reminder"
      usesAi={false}
      headerRight={<ResetButton label="Reset" onPress={form.reset} />}
      footer={<ReminderFormFooter form={form} />}
    >
      <Section>
        <ReminderFormFields form={form} />
      </Section>
    </ToolScreen>
  );
}
