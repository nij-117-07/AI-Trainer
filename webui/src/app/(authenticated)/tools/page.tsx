import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ToolsCardGrid } from "@/features/learning/components/ToolsCardGrid";
import { visionConverterTools } from "@/features/tools/lib/vision-converter-tools";
import { ingredientsTools } from "@/features/tools/lib/ingredients-tools";
import { socialPostsTools } from "@/features/tools/lib/social-posts-tools";
import { promptGeneratorTools } from "@/features/tools/lib/prompt-generator-tools";
import { flexibleWriterTools } from "@/features/tools/lib/flexible-writer-tools";
import { diagramTools } from "@/features/tools/lib/diagram-tools";
import { creativeAssetsTools } from "@/features/tools/lib/creative-assets-tools";
import { chartsTools } from "@/features/tools/lib/charts-tools";
import { rssTools } from "@/features/tools/rss/lib/rss-tools";
import { aiDetectorTools } from "@/features/tools/lib/ai-detector-tools";

export const metadata: Metadata = {
  title: "Tools Hub",
  description: "AI-powered productivity tools: vision, content, diagrams, charts, and more.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <SetPageTitle title="Tools Hub" />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tools Hub</h1>
        <p className="max-w-2xl text-muted-foreground">
          AI-powered helpers for converting images, writing content, generating
          diagrams and charts, and checking what is really in your food.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Visual</h2>
        </div>
        <ToolsCardGrid
          tools={[...visionConverterTools, ...diagramTools, ...chartsTools]}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Content</h2>
        </div>
        <ToolsCardGrid
          tools={[...socialPostsTools, ...creativeAssetsTools, ...flexibleWriterTools, ...promptGeneratorTools, ...aiDetectorTools]}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reading</h2>
        </div>
        <ToolsCardGrid tools={rssTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Lifestyle</h2>
        </div>
        <ToolsCardGrid tools={ingredientsTools} />
      </section>
    </div>
  );
}
