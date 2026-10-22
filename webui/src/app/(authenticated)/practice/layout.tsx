import { SidebarProvider } from "@/components/ui/sidebar";
import { PracticeSidebar } from "@/features/practice/components/PracticeSidebar";

interface PracticeLayoutProps {
  children: React.ReactNode;
}

export default async function PracticeLayout({ children }: PracticeLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <PracticeSidebar />
      <div className="flex w-full flex-1 flex-col">
        <div className="flex-1 p-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
