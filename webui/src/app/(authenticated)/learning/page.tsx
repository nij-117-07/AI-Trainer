import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ExplainerToolsGrid } from "@/features/learning/components/ExplainerToolsGrid";
import { GuidesToolsGrid } from "@/features/learning/components/GuidesToolsGrid";
import { ToolsCardGrid } from "@/features/learning/components/ToolsCardGrid";
import { LearningHubCard } from "@/features/learning/components/LearningHubCard";
import { MapPinned } from "lucide-react";
import { conceptualBridgeTools } from "@/features/learning/lib/conceptual-bridge-tools";
import { memoryHelperTools } from "@/features/learning/lib/memory-helper-tools";
import { motivationTools } from "@/features/learning/lib/motivation-tools";
import { projectsTools } from "@/features/learning/lib/projects-tools";
import { resourceSuggestorTools } from "@/features/learning/lib/resource-suggestor-tools";
import { skillArchitectTools } from "@/features/learning/lib/skill-architect-tools";
import { tutorChatTools } from "@/features/learning/lib/tutor-chat-tools";
import { tutorTools } from "@/features/learning/lib/tutor-tools";

export const metadata: Metadata = {
  title: "Learning Hub",
  description: "AI-powered tools for explaining, simplifying, memorizing, and mastering any topic.",
};

export default function LearningPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <SetPageTitle title="Learning Hub" />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
        <p className="max-w-2xl text-muted-foreground">
          Pick an explainer tool to break down a topic, build a study roadmap, get
          guided tasks, or challenge what you already know.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Explainer Tools</h2>
        </div>
        <ExplainerToolsGrid />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Learning Guides</h2>
        </div>
        <GuidesToolsGrid />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Roadmap Planner</h2>
        <LearningHubCard
          href="/learning/roadmap"
          title="Roadmap Planner"
          description="Generate AI-powered learning roadmaps with main points, subpoints, milestones, and progress tracking."
          icon={MapPinned}
          accent="from-orange-400 to-rose-500 text-white"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Memory Helper</h2>
        <LearningHubCard
          href={memoryHelperTools[0].href}
          title={memoryHelperTools[0].title}
          description={memoryHelperTools[0].description}
          icon={memoryHelperTools[0].icon}
          accent={memoryHelperTools[0].accent}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Motivation & Reflection</h2>
        </div>
        <ToolsCardGrid tools={motivationTools} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Project Recommender</h2>
        <LearningHubCard
          href={projectsTools[0].href}
          title={projectsTools[0].title}
          description={projectsTools[0].description}
          icon={projectsTools[0].icon}
          accent={projectsTools[0].accent}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Resource Suggestor</h2>
        <LearningHubCard
          href={resourceSuggestorTools[0].href}
          title={resourceSuggestorTools[0].title}
          description={resourceSuggestorTools[0].description}
          icon={resourceSuggestorTools[0].icon}
          accent={resourceSuggestorTools[0].accent}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Skill Architect</h2>
        <LearningHubCard
          href={skillArchitectTools[0].href}
          title={skillArchitectTools[0].title}
          description={skillArchitectTools[0].description}
          icon={skillArchitectTools[0].icon}
          accent={skillArchitectTools[0].accent}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Adaptive Tutor</h2>
        <ToolsCardGrid tools={tutorTools} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tutor Chat</h2>
        <LearningHubCard
          href={tutorChatTools[0].href}
          title={tutorChatTools[0].title}
          description={tutorChatTools[0].description}
          icon={tutorChatTools[0].icon}
          accent={tutorChatTools[0].accent}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Conceptual Bridge</h2>
        <LearningHubCard
          href={conceptualBridgeTools[0].href}
          title={conceptualBridgeTools[0].title}
          description={conceptualBridgeTools[0].description}
          icon={conceptualBridgeTools[0].icon}
          accent={conceptualBridgeTools[0].accent}
        />
      </section>
    </div>
  );
}
