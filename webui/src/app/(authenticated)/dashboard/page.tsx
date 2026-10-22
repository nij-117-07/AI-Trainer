import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowRight,
  GraduationCap,
  Languages,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Swords,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { validateIdentity } from "@/features/identity/lib/auth-guard";
import { Footer } from "@/features/common/components/Footer";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getPages } from "@/features/masteradmin/admin/actions/page-actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Dashboard | Application Hub",
  description: "Jump into the Learning, Practice, Linguistic, Tools, and Admin hubs from one place.",
};

interface HubConfig {
  key: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  adminOnly?: boolean;
}

const HUBS: HubConfig[] = [
  {
    key: "learning",
    title: "Learning",
    tagline: "Understand deeply",
    description: "Explainer tools, adaptive tutors, roadmaps, skill trees, and hands-on project ideas.",
    href: "/learning",
    icon: GraduationCap,
    accent: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    key: "practice",
    title: "Practice",
    tagline: "Sharpen skills",
    description: "Puzzles, riddles, debates, negotiation, bias training, and AI-powered challenge games.",
    href: "/practice",
    icon: Swords,
    accent: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    key: "linguistic",
    title: "Linguistic",
    tagline: "Master languages",
    description: "Idioms, lessons, translators, roleplay, poetry, and language testing in your target language.",
    href: "/linguistic",
    icon: Languages,
    accent: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "tools",
    title: "Tools",
    tagline: "Build faster",
    description: "Vision conversion, diagrams, charts, content generators, and prompt engineering utilities.",
    href: "/tools",
    icon: Wrench,
    accent: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    key: "admin",
    title: "Admin",
    tagline: "Manage the platform",
    description: "Users, pages, billing, and system settings for the whole application.",
    href: "/admin",
    icon: ShieldCheck,
    accent: "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    adminOnly: true,
  },
];

export default async function DashboardPage() {
  const identity = await validateIdentity();
  const isAdmin = identity.groups.some((g) => g.toLowerCase() === "admin");

  let pages: { href: string }[] = [];
  try {
    pages = await getPages();
  } catch (error) {
    console.error("[Dashboard] Error loading pages:", error);
  }

  const visibleHubs = HUBS.filter((hub) => !hub.adminOnly || isAdmin);
  const totalTools = pages.filter((p) =>
    visibleHubs.some((hub) => p.href.startsWith(`/${hub.key}`))
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SetPageTitle title="Dashboard" />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="space-y-8">
          <header className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 sm:px-10">
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
            <p className="relative flex items-center gap-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Welcome back, {identity.username}
            </p>
            <h1 className="relative mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              What are we learning today?
            </h1>
            <p className="relative mt-3 max-w-2xl text-muted-foreground">
              Pick a hub to explore AI-powered tools for learning, practice, language, and
              productivity. {totalTools} tools across {visibleHubs.length} hubs.
            </p>
          </header>

          <section aria-label="Application Hubs">
            <div className="mb-4 flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Explore hubs</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleHubs.map((hub) => {
                const Icon = hub.icon;
                const count = pages.filter((p) => p.href.startsWith(`/${hub.key}`)).length;
                return (
                  <Link
                    key={hub.key}
                    href={hub.href}
                    className="group h-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label={`Open the ${hub.title} hub`}
                  >
                    <Card className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-lg">
                      <CardContent className="flex h-full flex-col gap-4 p-6">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "inline-flex h-11 w-11 items-center justify-center rounded-xl border",
                              hub.accent
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {hub.tagline}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                            {hub.title}
                          </h2>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {hub.description}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                          <span className="text-muted-foreground">
                            {count} {count === 1 ? "tool" : "tools"}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium text-primary">
                            Explore
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
