// src/app/learning/index.tsx
import { HubMenu } from "@/components/tool/HubMenu";
import { appsInGroup } from "@/features/dashboard/data/apps";

export default function LearningHubRoute() {
  return <HubMenu title="Learning" items={appsInGroup("learning")} />;
}
