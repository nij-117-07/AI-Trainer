// src/app/(authenticated)/layout.tsx
/**
 * Authenticated Layout Component.
 * Fixed side-space constraints by switching from a fixed-width container to 
 * a fluid width container layout, allowing full horizontal responsiveness.
 */
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Navbar } from "@/features/navigation/components/Navbar";
import { PageTitleProvider } from "@/features/navigation/components/page-title-context";
import { validateIdentity } from "@/features/identity/lib/auth-guard";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  // 1. Pre-flight cookie validation to minimize redundant API hits
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.get("auth_token")?.value || 
                        cookieStore.get("auth_mode")?.value;

  if (!hasAuthCookie) {
    console.log("[AUTH] No cookies found, redirecting to select-mode");
    redirect("/select-mode");
  }
  
  // 2. Comprehensive identity check
  await validateIdentity();
  
  return (
    <PageTitleProvider>
      <div className="relative flex min-h-screen flex-col bg-background">
        {/* Global Application Navigation */}
        <Navbar />
        
        {/* Core Content Area 
          FIXED: Removed 'container mx-auto' to enable full-bleed edge-to-edge layouts.
          Added 'w-full px-6 lg:px-8' for clean, dynamic responsive side padding.
        */}
        <main className="flex-1 w-full px-6 py-8 md:px-8 lg:px-12">
          {children}
        </main>
      </div>
    </PageTitleProvider>
  );
}