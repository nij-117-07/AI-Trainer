import { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LearningSidebar } from "@/features/learning/components/LearningSidebar";

interface LearningLayoutProps {
  children: React.ReactNode;
}

export default async function LearningLayout({ children }: LearningLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Suspense fallback={null}>
        <LearningSidebar />
      </Suspense>
      <div className="flex w-full flex-1 flex-col">
        <div className="flex-1 p-6">{children}</div>
      </div>
    </SidebarProvider>
  );
}
