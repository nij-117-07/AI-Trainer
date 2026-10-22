import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { GuidesToolsGrid } from "@/features/learning/components/GuidesToolsGrid";

export const metadata: Metadata = {
  title: "Learning Guides | Learning",
  description: "Five AI-powered tools for guided tasks, daily plans, project blueprints, and topic/project suggestions.",
};

export default function GuidesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <SetPageTitle title="Learning Guides" />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Learning Guides</h1>
        <p className="max-w-2xl text-muted-foreground">
          Choose a guide. Each one keeps your inputs saved locally, so you can close
          the page and pick up exactly where you left off.
        </p>
      </header>

      <GuidesToolsGrid />
    </div>
  );
}
