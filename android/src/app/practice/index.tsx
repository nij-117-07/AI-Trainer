// src/app/practice/index.tsx
import { HubMenu } from "@/components/tool/HubMenu";
import { appsInGroup } from "@/features/dashboard/data/apps";

export default function PracticeHubRoute() {
  return <HubMenu title="Practice" items={appsInGroup("practice")} />;
}
