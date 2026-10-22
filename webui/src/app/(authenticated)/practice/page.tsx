import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ToolsCardGrid } from "@/features/learning/components/ToolsCardGrid";
import { testingPortalTools } from "@/features/practice/lib/testing-portal-tools";
import { graderTools } from "@/features/practice/lib/grader-tools";
import { reasoningTools } from "@/features/practice/lib/reasoning-tools";
import { communicationTools } from "@/features/practice/lib/communication-tools";
import { simulationTools } from "@/features/practice/lib/simulation-tools";

export const metadata: Metadata = {
  title: "Practice Hub",
  description: "Generate practice questions, grade your performance, and train reasoning, communication, and simulation skills with AI feedback.",
};

export default function PracticePage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <SetPageTitle title="Practice Hub" />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Practice Hub</h1>
        <p className="max-w-2xl text-muted-foreground">
          Test yourself with generated questions, get subject-matter-expert
          answers, and train your reasoning, communication, and strategic
          thinking with AI-powered simulations.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assessment</h2>
        </div>
        <ToolsCardGrid tools={testingPortalTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Feedback</h2>
        </div>
        <ToolsCardGrid tools={graderTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reasoning &amp; Logic</h2>
        </div>
        <ToolsCardGrid tools={reasoningTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Communication &amp; EQ</h2>
        </div>
        <ToolsCardGrid tools={communicationTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Simulations</h2>
        </div>
        <ToolsCardGrid tools={simulationTools} />
      </section>
    </div>
  );
}
