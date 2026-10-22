// src/features/navigation/components/Navbar.tsx
/**
 * Main Navigation Bar - Server Component.
 * Fetches identity server-side and renders branding, search, theme toggle, and user menu.
 */
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { PageTitle } from "./PageTitle";
import { NavSearch } from "./NavSearch";
import { UserMenu } from "@/features/identity/components/UserMenu";
import { validateIdentity } from "@/features/identity/lib/auth-guard";
import { getPages } from "@/features/masteradmin/admin/actions/page-actions";
import { buildNavigationTree } from "../lib/build-navigation-tree";
import type { PageData } from "../types";

export async function Navbar() {
  const identity = await validateIdentity();
  let pagesData = await getPages();
  const isAdmin = identity.groups.some((g) => g.toLowerCase() === "admin");
  if (!isAdmin) {
    pagesData = pagesData.filter((p) => !p.tags?.includes("admin"));
  }
  const rootNode = buildNavigationTree(pagesData as PageData[]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-(--navbar-height) items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-1.5 font-bold text-xl tracking-tight shrink-0">
            <span className="text-primary">AI</span>
            <span className="text-foreground">Studio</span>
          </Link>
          <PageTitle />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex">
            <NavSearch rootNode={rootNode} />
          </div>
          <ThemeToggle />
          <UserMenu identity={identity} />
        </div>
      </div>
    </header>
  );
}
