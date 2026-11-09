// src/features/message-refiner/lib/signatures.ts
/** Ax signature for the Message Refiner. Rewrites a draft message for a tone, audience, and goal. */
import { f } from "@ax-llm/ax";

const INSTRUCTION =
  "You are an expert business and personal communication editor. Rewrite the draft message in the requested tone for the stated audience, so it clearly achieves the goal. Keep every fact and commitment from the original; do not invent new ones. Use natural, human wording. Keep it as short as the goal allows. If the message is an email, suggest a clear subject line; otherwise return an empty subject. List the main changes you made.";

export const messageRefinerSignature = f()
  .description(INSTRUCTION)
  .input("message", f.string("The draft message to improve."))
  .input("tone", f.string("The tone to use, e.g. friendly, professional, concise, persuasive, empathetic, apologetic, or assertive."))
  .input("audience", f.string("Who receives the message and their relationship to the sender. 'None' if not given."))
  .input("goal", f.string("What the message should achieve, e.g. get a reply, confirm a meeting. 'None' if not given."))
  .output("refinedMessage", f.string("The rewritten message, ready to send."))
  .output("subjectLine", f.string("A short subject line if the message is an email, otherwise empty."))
  .output("changes", f.string("One change made and why, in plain language.").array())
  .build();
