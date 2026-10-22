import { redirect } from "next/navigation";
import { validateIdentity } from "@/features/identity/lib/auth-guard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const identity = await validateIdentity();

  const isAdmin = identity.groups.some(
    (g) => g.toLowerCase() === "admin"
  );

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AdminSidebar />
      <div className="flex w-full flex-1 flex-col">
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
