---
name: ax-llm
description: Write and review Ax (@ax-llm/ax) signatures in TypeScript, the DSPy-style equivalent of dspy.Signature. Use when defining the instruction (the class docstring equivalent), input and output field descriptions, types, constraints, or class/boolean value guidance with ax(), s(), or f(). Also covers running a signature as a generator (the dspy.Predict / ChainOfThought equivalent) and multimodal inputs (image, audio, file).
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: signatures
  package: "@ax-llm/ax"
  upstream: "https://github.com/ax-llm/ax"
---

# Ax Signatures (@ax-llm/ax)

A signature declares a task: its instruction, its typed inputs, and its typed outputs. Ax renders all three into the prompt. This skill covers signatures only.

## Reference

- Signature reference (most complete): https://raw.githubusercontent.com/ax-llm/ax/main/src/ax/skills/ax-signature.md
- Repo: https://github.com/ax-llm/ax
- Examples: https://github.com/ax-llm/ax/tree/main/src/examples (see `standard-schema.ts`, `fluent-signature-example.ts`, `structured_output.ts`)

## DSPy to Ax Mapping

In DSPy, the class docstring is the instruction and each field's `description=` is the field guidance. Ax has no class. The same information lives on the signature itself.

| DSPy | Ax string form | Ax fluent form |
|---|---|---|
| Class docstring (instruction) | Leading quoted text: `"Instruction" in:string -> out:string` | `f().description('Instruction')` |
| `dspy.InputField(description=...)` | Quoted text after the type: `name:string "description"` | `f.string('description')` |
| `dspy.OutputField(description=...)` | Quoted text after the type: `name:string "description"` | `f.string('description')` |
| `Literal["a", "b"]` | `name:class "a, b"` (output fields) | `f.class(['a', 'b'], 'description')` |
| `Optional[X] = None` | `name?:type` | `.optional()` |
| `List[X]` | `name:type[]` | `.array()` |
| `Dict` / nested dict | `name:object{ key:type, ... }` | `f.object({ key: f.string('...') }, 'description')` |

Ax accepts the instruction and field descriptions in three equivalent styles. Use the smallest one that fits.

Note: an instruction can also be passed as an option to the generator, `ax(sig, { description: '...' })`. Prefer keeping it in the signature so it travels with the contract.

## 1. Instruction (Class Docstring Equivalent)

String form, quoted at the very start, before the first field:

```typescript
import { ax } from '@ax-llm/ax';

const clarifier = ax(
  '"You are a senior interviewer evaluating requirements clarification. Judge whether the candidate asked about scale, edge cases, and priorities." problemStatement:string, userQuestions:string[] -> clarificationScore:number(min 0, max 100), overallFeedback:string',
);
```

Fluent form:

```typescript
import { f } from '@ax-llm/ax';

const clarifier = f()
  .description('You are a senior interviewer evaluating requirements clarification. Judge whether the candidate asked about scale, edge cases, and priorities.')
  .input('problemStatement', f.string('The system design problem given to the candidate'))
  .input('userQuestions', f.string('Clarifying questions the candidate asked').array())
  .output('clarificationScore', f.number('Score from 0 to 100 for clarification quality').min(0).max(100))
  .output('overallFeedback', f.string('Constructive feedback on the clarification phase'))
  .build();
```

Rules for the instruction:
- Write it as a role plus a task: who the model is, what to do, what to judge.
- Put the output contract in the instruction only when it is not already clear from the fields.
- Keep the quoted string on one line. Use the fluent `.description()` with a template literal for longer text.
- Do not repeat field-level details here. Put those on the fields.

## 2. Field Descriptions

Each field gets one short, specific description. The description is what tells the model what to put in that field.

String form, description in quotes after the type and any modifiers:

```typescript
const sig = ax(
  '"Score sales leads" leadNotes:string "Free-text notes from the call" -> fitScore:number(min 0, max 100) "0 to 100 fit for our ICP", nextStep:class "call, email, drop" "Recommended next action"',
);
```

Fluent form, description as the first argument of each type helper:

```typescript
const sig = f()
  .input('leadNotes', f.string('Free-text notes from the call'))
  .output('fitScore', f.number('0 to 100 fit for our ICP').min(0).max(100))
  .output('nextStep', f.class(['call', 'email', 'drop'], 'Recommended next action'))
  .build();
```

Zod form, description with `.describe()`:

```typescript
import { z } from 'zod';

const sig = f()
  .input('leadNotes', z.string().describe('Free-text notes from the call'))
  .output('fitScore', z.number().min(0).max(100).describe('0 to 100 fit for our ICP'))
  .build();
```

Rules for field descriptions:
- Say what the value is and how to fill it, with an example when the format is not obvious (`e.g., '100M DAU'`).
- For a number, state the range. For a list, state what each item is.
- For a date, state the format.
- Do not put the instruction in a field description. Put it in the signature instruction.

### Long field guidance (the multi-line docstring case)

DSPy often puts a dict spec inside a multi-line `description=`. In Ax, use a template literal in the fluent form:

```typescript
const analysis = f()
  .input('userQuestions', f.string('Clarifying questions the candidate asked').array())
  .output(
    'questionsAnalysis',
    f.object({
      question: f.string("The candidate's question"),
      category: f.class(
        ['functional', 'non_functional', 'scale', 'edge_case', 'constraint', 'priority'],
        'Which area the question covers',
      ),
      quality: f.class(['excellent', 'good', 'neutral', 'redundant', 'misguided'], 'How useful the question was'),
      reasoning: f.string('Why this quality was assigned'),
    }, `
      Analysis of each question the candidate asked.
      One entry per question. Keep reasoning to one sentence.
    `).array(),
  )
  .build();
```

For the string form, keep the same guidance short and put the detail in the nested field descriptions instead of a long quoted string.

## 3. Types

| Type | String syntax | Fluent | TypeScript result |
|---|---|---|---|
| String | `name:string` | `f.string(desc)` | `string` |
| Number | `name:number` | `f.number(desc)` | `number` |
| Boolean | `name:boolean` | `f.boolean(desc)` | `boolean` |
| Class (enum) | `name:class "a, b, c"` | `f.class(['a','b','c'], desc)` | `'a' \| 'b' \| 'c'` |
| Date | `name:date` | `f.date(desc)` | `Date` |
| Datetime | `name:datetime` | `f.datetime(desc)` | `Date` |
| URL | `name:url` | `f.url(desc)` | `string` |
| Code | `name:code(python)` | `f.code(desc)` | `string` |
| JSON | `name:json` | `f.json(desc)` | `any` |
| Object | `name:object{ a:string, b?:number }` | `f.object({ ... }, desc)` | typed object |
| Image (input) | `name:image` | `f.image(desc)` | image object |
| Audio | `name:audio` | `f.audio(desc)` | audio input or output |
| File (input) | `name:file` | `f.file(desc)` | file object |

Rules for types:
- Use `class` for a fixed set of labels. Its values are output-only.
- Use `object{...}` for structured output. Use `[]` after it for a list of objects.
- Media (`image`, `file`) is input only and top-level only.
- `z.enum()` maps to `class`, so use it on output fields only.

## 4. Constraints and Modifiers

String form, modifiers in parentheses after the type. The string form is strict: a modifier that does not apply to the type is a parse error.

| Modifier | Applies to | Example |
|---|---|---|
| `min N` / `max N` | string length, number value | `score:number(min 0, max 100)` |
| `format email\|uri\|date\|date-time` | string | `contact:string(format email)` |
| `pattern "regex" "desc"` | string | `invoiceNo:string(pattern "^INV-\\d+$" "INV- then digits")` |
| `item "desc"` | arrays | `tags:string(item "a short tag")[]` |
| `cache` | top-level input | `corpus:string(cache)` |
| `true "desc"` / `false "desc"` | boolean | `urgent:boolean(true "...", false "...")` |

Optional fields and internal fields:

- `note?:string`: optional. Goes on the name, never after the type.
- `reasoning!:string`: internal. Ax generates it but strips it from the result. Use it for chain-of-thought.

Fluent equivalents: `.min()`, `.max()`, `.email()`, `.url()`, `.regex(pattern, message)`, `.optional()`, `.array()`, `.cache()`, `.internal()`.

Zod equivalents: `.min()`, `.max()`, `.email()`, `.url()`, `.regex()`, `.refine()`. These run in the retry pipeline, so a failed check sends feedback to the model and retries.

## 5. Describing Boolean and Class Values

When each label needs its own guidance, describe the labels instead of only listing them:

```typescript
const triage = ax(`
  "Triage a support ticket." ticketText:string ->
  urgent:boolean(
    true "Customers cannot complete a core task",
    false "A routine request or minor inconvenience"
  ) "Does this need immediate attention?",
  team:class "support, billing, engineering"(
    support "Product usage questions",
    billing "Invoice or charge disputes",
    engineering "Broken functionality"
  ) "Which team should investigate?"
`);
```

Fluent equivalent:

```typescript
const team = f.class(['support', 'billing', 'engineering'], 'Which team should investigate?')
  .describeValues({
    support: 'Product usage questions',
    billing: 'Invoice or charge disputes',
    engineering: 'Broken functionality',
  });
```

Descriptions are guidance, not extra validation. Partial descriptions are allowed. Unknown labels and duplicate keys are errors.

## 6. Naming

- Field names are part of the prompt. Use specific names: `customerEmail`, `clarificationScore`, `missedQuestions`.
- Avoid `text`, `data`, `input`, `output`, `result`, `val`, `x`.
- Names cannot start with a number.
- Keep input and output names distinct within one signature.

## 7. Converting a DSPy Class

Source (DSPy):

```python
class RequirementsClarifier(dspy.Signature):
    """You are a senior interviewer evaluating the first phase of a system design
    interview: requirements clarification. Evaluate whether the user asked about
    scale, clarified edge cases, and prioritized features correctly."""

    problem_statement: str = dspy.InputField(description="The system design problem given to the user.")
    user_questions: List[str] = dspy.InputField(description="List of clarifying questions the user asked.")
    clarification_score: float = dspy.OutputField(description="Score from 0.0 to 100.0 for quality of clarification.")
    red_flags: List[str] = dspy.OutputField(description="Warning signs (e.g., jumped straight to design without asking questions).")
```

Ax, fluent form (preferred for multi-line guidance):

```typescript
import { f } from '@ax-llm/ax';

const requirementsClarifier = f()
  .description(`You are a senior interviewer evaluating the first phase of a system design
    interview: requirements clarification. Evaluate whether the user asked about
    scale, clarified edge cases, and prioritized features correctly.`)
  .input('problemStatement', f.string('The system design problem given to the user'))
  .input('userQuestions', f.string('Clarifying questions the user asked').array())
  .output('clarificationScore', f.number('Score from 0 to 100 for clarification quality').min(0).max(100))
  .output('redFlags', f.string('Warning signs, e.g. jumped to design without asking questions').array())
  .build();
```

Ax, string form (same contract, one line):

```typescript
const requirementsClarifier = ax(
  '"You are a senior interviewer evaluating requirements clarification. Evaluate whether the user asked about scale, edge cases, and priorities." problemStatement:string "The system design problem given to the user", userQuestions:string[] "Clarifying questions the user asked" -> clarificationScore:number(min 0, max 100) "Score 0 to 100 for clarification quality", redFlags:string[] "Warning signs, e.g. jumped to design without asking questions"',
);
```

Steps to convert:
1. Move the class docstring to the instruction (`.description()` or the leading quoted string).
2. Move each `description=` onto its field, one short line each. Move dict or key specs into a template literal on an `object` field.
3. Map `Literal[...]` to `class`, `Optional` to `?` or `.optional()`, `List` to `[]` or `.array()`, and `float` to `number` with `min`/`max` where the range is known.
4. Keep the field names the same, so calling code only changes its input and output keys in one place.
5. Move any `default=None` input fields to optional.

## 8. Running a Signature (Generator)

In DSPy you wrap a signature in `dspy.Predict(Sig)` and call it. In Ax, `ax(sig)` creates the generator, and `forward()` calls it. The generator is the `Predict` equivalent.

```typescript
import { ai, ax } from '@ax-llm/ax';

const llm = ai({ name: 'openai', apiKey: process.env.OPENAI_APIKEY! });
const predictor = ax(requirementsClarifier);   // dspy.Predict(RequirementsClarifier)

const result = await predictor.forward(llm, {  // predictor(problemStatement=..., userQuestions=...)
  problemStatement: 'Design a URL shortener for 100M DAU.',
  userQuestions: ['What is the read/write ratio?', 'Do links expire?'],
});
console.log(result.clarificationScore, result.redFlags);
```

Rules:
- The first argument to `forward()` is the `ai(...)` client, not an API key.
- Input keys must match the signature's input field names. Output keys come back typed.
- Create the generator once and reuse it. Build a new one only when the signature changes.
- Use `streamingForward()` when you want partial output. Do not pass a stream option to `forward()`.

### Chain of thought (ChainOfThought equivalent)

In DSPy, `dspy.ChainOfThought(Sig)` adds a `reasoning` field before the outputs. In Ax, add an internal output with `!`. Ax generates it but strips it from the result:

```typescript
const reasoned = ax(
  'problemText:string -> reasoning!:string, solutionText:string',
);
```

Fluent form: `.output('reasoning', f.string('Step-by-step reasoning').internal())`.

To read the reasoning, set `showThoughts: true` on the call and read `result.thought`. Use this for models with native reasoning instead of an extra field.

### Per-call options

```typescript
const result = await predictor.forward(llm, input, {
  maxRetries: 3,
  modelConfig: { temperature: 0.2 },
  abortSignal: AbortSignal.timeout(15_000),
});
```

Set defaults once on the generator with `ax(sig, { description, maxRetries, modelConfig })`. A value passed on the call overrides the default.

### Validation errors

If the output fails a constraint (for example `min`/`max`, `class`, or a `pattern`), Ax retries with the error as feedback, up to `maxRetries`. If retries run out, it throws `AxGenerateError`:

```typescript
import { AxGenerateError } from '@ax-llm/ax';

try {
  await predictor.forward(llm, input);
} catch (err) {
  if (err instanceof AxGenerateError) console.log(err.details.model, err.details.signature);
}
```

### Checking the prompt

To confirm the instruction and field descriptions the model actually received, read the chat log after a call:

```typescript
for (const entry of predictor.getChatLog()) {
  for (const msg of entry.messages) {
    if (msg.role === 'system') console.log(msg.content);
  }
}
```

If the instruction does not show up in the system message, the signature was not built as intended.

## 9. Multimodal Inputs

Multimodal fields are declared in the signature like any other field, with the media type. Pass the media as an object in `forward()`.

| Type | Declare | Value you pass |
|---|---|---|
| Image | `photo:image` | `{ mimeType: 'image/png', data: '<base64>' }`, optional `details: 'low' \| 'high' \| 'auto'` |
| Audio | `recording:audio` | `{ data: '<base64>', format: 'wav' }` (also `mimeType`, `sampleRate`, `channels`) |
| File | `document:file` | `{ mimeType: 'application/pdf', data: '<base64>', filename: 'doc.pdf' }`, or `fileUri` instead of `data` |

Fluent form:

```typescript
import { f } from '@ax-llm/ax';

const productScan = f()
  .description('Describe a product from its photo and any attached spec sheet.')
  .input('productPhoto', f.image('Photo of the product'))
  .input('specSheet', f.file('Optional spec sheet PDF').optional())
  .input('question', f.string('What the user wants to know').optional())
  .output('productDescription', f.string('Short description of what is shown'))
  .output('detectedObjects', f.string('Objects visible in the photo').array())
  .build();
```

Usage:

```typescript
import { readFileSync } from 'node:fs';
import { ai, ax } from '@ax-llm/ax';

const llm = ai({ name: 'openai', apiKey: process.env.OPENAI_APIKEY! });
const scan = ax(productScan);

const photo = readFileSync('./shoe.png').toString('base64');

const result = await scan.forward(llm, {
  productPhoto: { mimeType: 'image/png', data: photo },
  question: 'Is this waterproof?',
});
```

String form for the same idea:

```typescript
const scan = ax('productPhoto:image, question?:string -> productDescription:string, detectedObjects:string[]');
```

Rules for multimodal:
- Image and file fields are top-level inputs only. They cannot sit inside `object{...}`.
- Audio can be a top-level input, and a single top-level output (`speech:audio`) produces spoken output. Media arrays are supported for inputs only.
- Pass `data` as base64 (no `data:` URL prefix). Set `mimeType` correctly.
- Use `cache: true` (`.cache()`, or `(cache)` in the string form) on large media that repeats across calls, such as a shared document.
- Not every model accepts every media type. Check the provider's model capabilities before you rely on a type. Ax lists image support for OpenAI, Gemini, and Anthropic. Test with one real call first.
- When a signature has an audio output, the model writes the script and Ax synthesizes the speech. Pass `speech: { speak: { voice: 'alloy', format: 'mp3' } }` as a call option and read `result.speech.data`.

## 10. Common Mistakes

- Trying to find a docstring. Put the instruction on the signature with `.description()` or the leading quoted string.
- Putting the task instruction in every field description. Keep it on the signature, and keep fields short.
- A vague field name with a long description. Rename the field so it says what it holds.
- Using `z.enum()` or `class` on an input. Both are output-only.
- Using `f.array(f.string())` or `f.optional(...)`. These are removed. Use `f.string().array()` and `.optional()`.
- Putting `?` after the type (`name:string?`). The optional marker goes on the name (`name?:string`).
- Writing a number range only in prose. Use `min` and `max` so validation enforces it.
- Using `default=None` logic in the signature. Mark the field optional and handle the missing value in code.

## Checklist

- [ ] The signature has an instruction that states the role and the task.
- [ ] Every input and output has a short, specific description.
- [ ] Field names are specific and do not start with a number.
- [ ] Fixed label sets use `class`, with value descriptions when labels need guidance.
- [ ] Numbers have `min`/`max`, and strings have `format` or `pattern` where applicable.
- [ ] Optional fields use `?` on the name, and internal reasoning uses `!`.
- [ ] After one real call, the system message in `getChatLog()` shows the expected instruction and field descriptions.
- [ ] The generator is created once with `ax(sig)` and called with `forward(llm, values)`.
- [ ] Multimodal fields are top-level, media is passed as base64 with the correct `mimeType`, and the chosen model supports that media type.
