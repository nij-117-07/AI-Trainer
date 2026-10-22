import { Metadata } from "next";
import { SetPageTitle } from "@/features/navigation/components/SetPageTitle";
import { ToolsCardGrid } from "@/features/learning/components/ToolsCardGrid";
import { idiomsTools } from "@/features/linguistic/lib/idioms-tools";
import { wordOfTheDayTools } from "@/features/linguistic/lib/word-of-the-day-tools";
import { sentenceOfTheDayTools } from "@/features/linguistic/lib/sentence-of-the-day-tools";
import { translatorTools } from "@/features/linguistic/lib/translator-tools";
import { rewriterTools } from "@/features/linguistic/lib/rewriter-tools";
import { lessonTools } from "@/features/linguistic/lib/lesson-tools";
import { poetEngineTools } from "@/features/linguistic/lib/poet-engine-tools";
import { languageTesterTools } from "@/features/linguistic/lib/language-tester-tools";
import { simulatorTools } from "@/features/linguistic/lib/simulator-tools";
import { roleplayTools } from "@/features/linguistic/lib/roleplay-tools";

export const metadata: Metadata = {
  title: "Linguistic Hub",
  description: "AI-powered language tools for idiomatic expressions and more.",
};

export default function LinguisticPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <SetPageTitle title="Linguistic Hub" />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Linguistic Hub</h1>
        <p className="max-w-2xl text-muted-foreground">
          Learn language the natural way — idiomatic expressions with meaning,
          cultural context, and real-world usage.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Idioms</h2>
        </div>
        <ToolsCardGrid tools={idiomsTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Word of the Day</h2>
        </div>
        <ToolsCardGrid tools={wordOfTheDayTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sentence of the Day</h2>
        </div>
        <ToolsCardGrid tools={sentenceOfTheDayTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Translator</h2>
        </div>
        <ToolsCardGrid tools={translatorTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Rewriter</h2>
        </div>
        <ToolsCardGrid tools={rewriterTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Lesson</h2>
        </div>
        <ToolsCardGrid tools={lessonTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Poet Engine</h2>
        </div>
        <ToolsCardGrid tools={poetEngineTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Language Tester</h2>
        </div>
        <ToolsCardGrid tools={languageTesterTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Simulator</h2>
        </div>
        <ToolsCardGrid tools={simulatorTools} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Roleplay</h2>
        </div>
        <ToolsCardGrid tools={roleplayTools} />
      </section>
    </div>
  );
}
