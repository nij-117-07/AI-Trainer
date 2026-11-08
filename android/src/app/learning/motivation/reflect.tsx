// src/app/learning/motivation/reflect.tsx
import { ReflectTab } from "@/features/motivation/components/ReflectTab";
import { ToolScreen } from "@/components/tool/ToolScreen";

export default function ReflectRoute() {
  return (
    <ToolScreen title="Reflection Journal">
      <ReflectTab />
    </ToolScreen>
  );
}
