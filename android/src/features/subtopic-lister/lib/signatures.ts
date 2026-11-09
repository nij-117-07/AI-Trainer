// src/features/subtopic-lister/lib/signatures.ts
/** Ax signature for the Subtopic Lister. Breaks a topic into its main subtopics, ordered for learning. */
import { f } from "@ax-llm/ax";

const INSTRUCTION =
  "You are an expert curriculum designer. Break the given topic into distinct, non-overlapping subtopics that together cover it well for a learner at the stated level. Order them from foundational to advanced. Each subtopic name should be short and specific (2 to 6 words). Each description should be one or two sentences explaining what the subtopic covers. Do not include the topic itself as a subtopic.";

export const subtopicListerSignature = f()
  .description(INSTRUCTION)
  .input("topic", f.string("The subject to break down, e.g. 'Machine learning' or 'Japanese grammar'."))
  .input("level", f.string("The learner's level: beginner, intermediate, or advanced. Subtopics should match it."))
  .input("count", f.number("How many subtopics to return."))
  .output(
    "subtopics",
    f
      .object(
        {
          name: f.string("A short, specific subtopic name."),
          description: f.string("One or two sentences on what the subtopic covers."),
        },
        "The subtopics, ordered from foundational to advanced.",
      )
      .array(),
  )
  .build();
