// src/features/language-learner/components/LanguageLearnerMenu.tsx
/**
 * Language Learner landing page: one small box per sub-app. Tapping a box opens that sub-app.
 */
import { HubMenu } from "@/components/tool/HubMenu";
import { LANGUAGE_TOOLS } from "../data/tools";

export function LanguageLearnerMenu() {
  return <HubMenu title="Language Learner" items={LANGUAGE_TOOLS} />;
}
