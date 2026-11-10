// src/features/next-topic-suggestor/lib/signature.ts
/** Ax signature for the Next Topic Suggestor. Recommends the next topics to study for a learner. */
import { f } from "@ax-llm/ax";

const INSTRUCTION =
  "You are an expert learning advisor. Recommend the next specific topics the learner should study. Stay within the broader topic, build on the background knowledge they listed, and lean toward their specific interest when one is given. Never repeat a previously suggested topic. Match the stated topic level. Return 4 to 6 recommendations ordered from the most natural next step to the most ambitious. Each topic name should be specific (2 to 6 words). Each reason should be one or two sentences on why it is a good next step.";

export const nextTopicSignature = f()
  .description(INSTRUCTION)
  .input("broaderTopic", f.string("The broad subject the learner is exploring."))
  .input("specificInterest", f.string("A narrower interest within the broad subject. 'None' if there is none."))
  .input("learnedBefore", f.string("What the learner already knows, to build on."))
  .input("previousSuggestions", f.string("Topics already suggested, which must not be repeated. 'None' if there are none."))
  .input("customUserInput", f.string("Extra requests from the learner. 'None' if there are none."))
  .input("topicLevel", f.string("The level of the suggested topics: Beginner, Intermediate, or Advanced."))
  .input("seedUuid", f.string("A random value that makes each suggestion set unique."))
  .output(
    "recommendations",
    f
      .object(
        {
          topicName: f.string("The specific topic name."),
          reason: f.string("Why this is a good next step."),
        },
        "The recommended next topics, in order.",
      )
      .array(),
  )
  .build();
