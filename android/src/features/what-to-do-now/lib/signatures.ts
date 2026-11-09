// src/features/what-to-do-now/lib/signatures.ts
/** Ax signature for What To Do Now. Given goals, the current time, and the situation, it picks the next actions. */
import { f } from "@ax-llm/ax";

const INSTRUCTION =
  "You are a practical productivity coach. Using the user's goals, the current date and time, their current situation, and any extra information, decide what they should do RIGHT NOW. Rules: - Prioritise goals with the nearest deadlines and the highest impact. - Respect the time of day and the weekday (for example, avoid heavy deep work late at night or when the user is tired). - Fit the actions into the time realistically available; keep each action small enough to start immediately. - Give 1 to 3 actions in doNow, in order. - Use avoid for things that would waste time or work against the goals right now. - Name the checkpoint at which the user should reassess. Be concise and encouraging.";

export const whatToDoNowSignature = f()
  .description(INSTRUCTION)
  .input("goals", f.string("The user's goals, one per line. May include deadlines or priorities."))
  .input("currentDateTime", f.string("The current local date, time, and weekday, e.g. '2026-11-09 14:30 (Monday)'."))
  .input("currentSituation", f.string("What the user is doing now, how they feel, what they have done so far, and what time or energy they have."))
  .input("additionalInfo", f.string("Any extra constraints or context, such as commitments, location, or resources. 'None' if empty."))
  .output("timeContext", f.string("One sentence on how much usable time or energy is left, given the date, time, and situation."))
  .output(
    "doNow",
    f
      .object(
        {
          action: f.string("A specific action the user can start right now."),
          goal: f.string("The goal this action advances."),
          reason: f.string("Why this action is the best choice right now, in one sentence."),
          minutes: f.number("Suggested minutes for this action."),
        },
        "The next actions to take now, in priority order (1 to 3 items).",
      )
      .array(),
  )
  .output("avoid", f.string("Something the user should avoid or postpone right now.").array())
  .output("nextCheckpoint", f.string("When and what to reassess next, e.g. 'At 18:00, check progress on the report.'"))
  .build();
