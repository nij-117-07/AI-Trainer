// src/app/tools/index.tsx
import { HubMenu } from "@/components/tool/HubMenu";
import { appsInGroup } from "@/features/dashboard/data/apps";

export default function ToolsHubRoute() {
  return <HubMenu title="Tools" items={appsInGroup("tools")} />;
}
