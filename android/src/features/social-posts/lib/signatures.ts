// src/features/social-posts/lib/signatures.ts
/**
 * Ax signature for the Social Media Post Generator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/tools/social_posts/services.py.
 */
import { f } from "@ax-llm/ax";
import { POST_GENERATOR_DESCRIPTIONS, POST_REVISION_DESCRIPTIONS } from "./signature-descriptions";

const post = POST_GENERATOR_DESCRIPTIONS;
const revision = POST_REVISION_DESCRIPTIONS;

export const postRevisionSignature = f()
  .description(revision.instruction)
  .input("platform", f.string(revision.inputs.platform))
  .input("userQuery", f.string(revision.inputs.userQuery))
  .input("originalPost", f.string(revision.inputs.originalPost))
  .input("changeRequest", f.string(revision.inputs.changeRequest))
  .output("content", f.string(revision.outputs.content))
  .output("designerNotes", f.string(revision.outputs.designerNotes))
  .build();

export const postGeneratorSignature = f()
  .description(post.instruction)
  .input("systemPrompt", f.string(post.inputs.systemPrompt))
  .input("platform", f.string(post.inputs.platform))
  .input("userQuery", f.string(post.inputs.userQuery))
  .input("numSuggestions", f.number(post.inputs.numSuggestions))
  .output("userMessage", f.string(post.outputs.userMessage))
  .output(
    "postSuggestions",
    f
      .object(
        {
          variantId: f.string("A number or label (e.g., '1')."),
          content: f.string("The actual post body content."),
          designerNotes: f.string("A brief explanation of why this post works for the platform."),
        },
        post.outputs.postSuggestions,
      )
      .array(),
  )
  .build();
