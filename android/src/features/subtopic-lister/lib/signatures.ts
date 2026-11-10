// src/features/subtopic-lister/lib/signatures.ts
/** Ax signature for the Subtopic Lister. Suggests the next subtopics from what the learner has finished. */
import { f } from "@ax-llm/ax";

const INSTRUCTION =
  "You are an expert curriculum designer. Read what the learner has already completed, grouped by subject, then choose the subtopics they should study next. Build on what they know, never repeat anything they have finished, and feel free to go deeper into a subject they are working on or branch into a related area. Choose how many subtopics to return based on what will move them forward. Order them from foundational to advanced. Each subtopic name should be short and specific (2 to 6 words). Each description should be one or two sentences explaining what the subtopic covers and why it comes next.";

export const subtopicListerSignature = f()
  .description(INSTRUCTION)
  .input(
    "learnedTopics",
    f.string(
      "What the learner has completed, one subject per line, with its finished items separated by semicolons. 'Nothing yet' means no progress is recorded.",
    ),
  )
  .output(
    "subtopics",
    f
      .object(
        {
          name: f.string("A short, specific subtopic name."),
          description: f.string("One or two sentences on what the subtopic covers and why it comes next."),
        },
        "The suggested subtopics, ordered from foundational to advanced.",
      )
      .array(),
  )
  .build();
