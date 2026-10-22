import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ToolsCardGrid } from "@/features/learning/components/ToolsCardGrid";
import { motivationTools } from "@/features/learning/lib/motivation-tools";

export const metadata: Metadata = {
  title: "Motivation & Reflection | Learning",
  description: "Personalized motivational quotes and deep journaling prompts tuned to your emotional state.",
};

export default function MotivationPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <SetPageTitle title="Motivation & Reflection" />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Motivation & Reflection</h1>
        <p className="max-w-2xl text-muted-foreground">
          Choose a tool. Each one keeps your inputs saved locally, so you can close
          the page and pick up exactly where you left off.
        </p>
      </header>

      <ToolsCardGrid tools={motivationTools} />
    </div>
  );
}
