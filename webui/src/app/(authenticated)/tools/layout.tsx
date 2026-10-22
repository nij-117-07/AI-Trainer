import { SidebarProvider } from "@/components/ui/sidebar";
import { ToolsSidebar } from "@/features/tools/components/ToolsSidebar";

interface ToolsLayoutProps {
  children: React.ReactNode;
}

export default async function ToolsLayout({ children }: ToolsLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <ToolsSidebar />
      <div className="flex w-full flex-1 flex-col">
        <div className="flex-1 p-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
