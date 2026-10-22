import { SidebarProvider } from "@/components/ui/sidebar";
import { LinguisticSidebar } from "@/features/linguistic/components/LinguisticSidebar";

interface LinguisticLayoutProps {
  children: React.ReactNode;
}

export default async function LinguisticLayout({ children }: LinguisticLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <LinguisticSidebar />
      <div className="flex w-full flex-1 flex-col">
        <div className="flex-1 p-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
