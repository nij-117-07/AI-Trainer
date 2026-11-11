// src/features/topic-of-the-day/lib/signatures.ts
/** Ax signature for the Topic of the Day. Instructions and field descriptions live in signature-descriptions.ts. */
import { f } from "@ax-llm/ax";
import { TOPIC_OF_THE_DAY_DESCRIPTIONS } from "./signature-descriptions";

const topic = TOPIC_OF_THE_DAY_DESCRIPTIONS;

export const topicOfTheDaySignature = f()
  .description(topic.instruction)
  .input("currentDate", f.string(topic.inputs.currentDate))
  .input("subject", f.string(topic.inputs.subject))
  .input("focus", f.string(topic.inputs.focus).optional())
  .input(
    "level",
    f.string(`${topic.inputs.level} Preset options: Beginner, Intermediate, Advanced, Professional, Expert. Any other level is also accepted.`),
  )
  .input("context", f.string(topic.inputs.context).optional())
  .input("seed", f.string(topic.inputs.seed))
  .input("userCustomInstructions", f.string(topic.inputs.userCustomInstructions).optional())
  .output("title", f.string(topic.outputs.title))
  .output("whyItMatters", f.string(topic.outputs.whyItMatters))
  .output("keyIdeas", f.string(topic.outputs.keyIdeas).array())
  .output("explanation", f.string(topic.outputs.explanation))
  .output("workedExample", f.string(topic.outputs.workedExample))
  .output("starterQuestion", f.string(topic.outputs.starterQuestion))
  .output("tryToday", f.string(topic.outputs.tryToday))
  .build();
