// src/app/tools/habit-tracker/index.tsx
import { HabitTracker } from "@/features/habit-tracker/components/HabitTracker";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function HabitTrackerRoute() {
  return (
    <ToolScreen title="Habit Tracker">
      <HabitTracker />
    </ToolScreen>
  );
}
