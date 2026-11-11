// src/features/skill-architect/components/SkillTreeList.tsx
/** Skill Architect landing page: the saved trees as compact rows, or an empty state when there are none. */
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Layers } from "lucide-react-native";
import { CardGrid } from "@/components/tool/CardGrid";
import { EmptyHint } from "@/components/tool/EmptyHint";
import { Section } from "@/components/tool/Section";
import type { SkillArchitectTree } from "../types";
import { loadTrees } from "../lib/store";
import { SkillTreeRow } from "./SkillTreeRow";

export function SkillTreeList() {
  const router = useRouter();
  const [trees, setTrees] = useState<SkillArchitectTree[]>([]);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadTrees().then((list) => {
        if (!active) return;
        setTrees(list);
        setLoaded(true);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  function open(tree: SkillArchitectTree) {
    router.push(`/learning/skill-architect/${tree.id}` as never);
  }

  return (
    <Section>
      {loaded && trees.length === 0 && (
        <EmptyHint icon={Layers} title="No skill trees yet" hint="Pick any topic to see its skills, level by level." />
      )}

      <CardGrid>
        {trees.map((tree) => (
          <SkillTreeRow key={tree.id} tree={tree} onOpen={() => open(tree)} />
        ))}
      </CardGrid>
    </Section>
  );
}
