---
name: mastra
description: Build and debug TypeScript AI agents, tools, structured output, memory, and workflows with Mastra (@mastra/core). Use for Agent, createTool, createStep/createWorkflow, structured output, and memory, with models set as provider/model strings or as OpenAI-compatible custom endpoints.
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
  package: "@mastra/core"
  upstream: "https://github.com/mastra-ai/mastra"
---

# Mastra (@mastra/core)

Mastra is a TypeScript framework for AI agents and apps. This skill covers agents, tools, structured output, memory, and workflows, with models set as an OpenAI-compatible endpoint or a `provider/model` string.

Mastra's docs change quickly. Trust the live docs over this file when they disagree, and check model IDs before you hardcode them.

## Reference Links

Raw skill files (the Mastra team's agent guidance):

- Main Mastra skill (raw): https://raw.githubusercontent.com/mastra-ai/skills/main/skills/mastra/SKILL.md
- Skill repo: https://github.com/mastra-ai/skills (install with `npx skills add mastra-ai/skills --skill mastra`)
- Core concepts (agent vs workflow vs tool vs memory): https://raw.githubusercontent.com/mastra-ai/skills/main/skills/mastra/references/core-concepts.md
- Model selection and provider lookup: https://raw.githubusercontent.com/mastra-ai/skills/main/skills/mastra/references/model-selection.md
- Common errors: https://raw.githubusercontent.com/mastra-ai/skills/main/skills/mastra/references/common-errors.md

Raw docs (append `.md` to any docs URL):

- Docs index: https://mastra.ai/llms.txt
- Agents: https://mastra.ai/docs/agents/overview.md
- Tools: https://mastra.ai/docs/agents/tools.md
- Structured output: https://mastra.ai/docs/agents/structured-output.md
- Workflows: https://mastra.ai/docs/workflows/overview.md
- Memory: https://mastra.ai/docs/memory/overview.md
- Models and custom endpoints: https://mastra.ai/models/providers.md
- Model directory: https://mastra.ai/models.md
- Reference: https://mastra.ai/reference.md

If packages are installed, check `node_modules/@mastra/*/dist/docs/` first. It matches the installed version.

## Setup

```bash
npm install @mastra/core@latest zod@latest typescript@latest @types/node@latest mastra@latest
```

Requirements:
- `package.json` must have `"type": "module"`.
- `tsconfig.json` must use ES2022 modules (`"module": "ES2022"`, `"moduleResolution": "bundler"`). CommonJS fails.
- Import local files with extensions (`./agents/weather-agent.ts`) when running on Node 22.18+.

Project entry point, `src/mastra/index.ts`:

```typescript
import { Mastra } from '@mastra/core'

export const mastra = new Mastra({
  agents: { weatherAgent },
  workflows: { testWorkflow },
})
```

Register everything the app needs on this instance. Agents and workflows fetched with `mastra.getAgentById()` / `mastra.getWorkflow()` get shared storage, logging, and tracing.

## 1. Models (OpenAI-Compatible)

Mastra uses a model router. Set the model as a `provider/model` string, and Mastra reads the matching environment variable (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, and so on).

```typescript
model: 'openai/gpt-6.1-sol'
```

Use `openai/<model>` with a slash, never `openai:<model>`. Do not import a provider package for this form.

### Any OpenAI-compatible server

For a custom base URL (LM Studio, vLLM, Ollama's OpenAI endpoint, a gateway, or any server that speaks the OpenAI Chat Completions API), pass an object with `id` and `url`:

```typescript
import { Agent } from '@mastra/core/agent'

export const localAgent = new Agent({
  id: 'local-agent',
  name: 'Local Agent',
  instructions: 'You are a helpful assistant.',
  model: {
    id: 'lmstudio/qwen/qwen3-30b-a3b-2507',
    url: 'http://localhost:1234/v1',
    apiKey: process.env.LOCAL_API_KEY,
  },
})
```

Rules:
- `url` is the **base URL** that ends in `/v1`, not the full `/chat/completions` path.
- `id` controls routing. Use `provider/model` when the server expects a bare model name (for example `llama3.2`). Use `gateway/provider/model` when the server is a gateway that needs the upstream provider in the name (for example `openrouter/google/gemini-2.5-flash`).
- Custom endpoints use Chat Completions by default. If the server exposes the Responses API (`/v1/responses`), add `api: 'responses'`.
- `providerOptions` on a call must use the first segment of `id` as its key. For `id: 'lmstudio/...'`, use `lmstudio`.
- `apiKey` on the model object is documented for the OpenAI provider. Confirm it works with your custom `url` on the first call.

### Setting the model per call or per request

Models are strings, so they can be chosen at runtime:

```typescript
model: ({ requestContext }) => `${requestContext.get('provider-id')}/${requestContext.get('model-id')}`
```

### Fallbacks

```typescript
model: [
  { model: 'openai/gpt-6.1-sol', maxRetries: 3 },
  { model: 'anthropic/claude-sonnet-5-5', maxRetries: 2 },
]
```

### Check model IDs before using them

Run `scripts/provider-registry.mjs` from the mastra skill, or open https://mastra.ai/models, to confirm the provider key and model name. The model IDs in this file are examples from the docs at the time of writing.

## 2. Agents

```typescript
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'

export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'Support Agent',
  instructions: 'You answer product questions. Say "I don't know" when the docs do not cover it.',
  model: 'openai/gpt-6.1-sol',
  tools: { weatherTool },
  memory: new Memory(),
})
```

- `id`, `name`, `instructions`, and `model` are the core fields. `instructions` is the system prompt.
- Keep instructions specific: the role, what to do with tools, and what to avoid.
- Give each agent one job. Use workflows for fixed steps.

Calling an agent:

```typescript
const agent = mastra.getAgentById('support-agent')

const response = await agent.generate('How do I reset my password?')
console.log(response.text)

const stream = await agent.stream('Summarize the release notes.')
for await (const chunk of stream.textStream) {
  process.stdout.write(chunk)
}
```

`generate()` returns the full result after all tool calls. `stream()` returns chunks as they arrive. The result includes `text`, `toolCalls`, `toolResults`, `steps`, and `usage`.

## 3. Tools

Define tools with `createTool()`. A plain object does not execute.

```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a city',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    location: z.string(),
    temperatureCelsius: z.number(),
    conditions: z.string(),
  }),
  execute: async ({ location }) => {
    return { location, temperatureCelsius: 21, conditions: 'sunny' }
  },
})
```

Rules:
- `execute` takes `(inputData, context)`. The second argument holds `requestContext`, `tracingContext`, and `abortSignal`. Leave it out if you do not use it.
- Write a clear `description`. The model uses it to decide when to call the tool.
- Give `inputSchema` a `.describe()` on each field. The model reads these.
- Add `outputSchema` so results are typed and validated.
- Add tools to an agent with `tools: { name }`.

Built-in tools include `webFetchTool` (`@mastra/core/tools`), `askUserTool`, and task tools. See https://mastra.ai/docs/agents/tools.md.

## 4. Structured Output

Use `structuredOutput` to get a typed object instead of text. The schema is the input, and `response.object` is the validated output.

```typescript
import { z } from 'zod'

const response = await supportAgent.generate('Plan a three-day trip to Lisbon.', {
  structuredOutput: {
    schema: z.object({
      days: z.array(z.object({ day: z.number(), activities: z.array(z.string()) })),
    }),
  },
})

console.log(response.object)
```

Rules:
- Read `response.object`. Do not parse `response.text` yourself.
- With `errorStrategy: 'fallback'`, check `response.usedFallbackValue` to tell a fallback from a real answer.
- Some models cannot use tools and structured output together. Set `jsonPromptInjection: 'auto'`, which switches automatically when the model lacks native support. Gemini 2.5 needs `jsonPromptInjection: true` when tools are present.
- Use a `model` inside `structuredOutput` to run a second model that only does the structuring.
- To shorten the injected schema, set `instructions` with a compact description. Keep every field listed.

## 5. Memory

Memory stores conversation history. Pass a `resource` (the user) and a `thread` (the conversation) on each call.

```typescript
import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'

export const memoryAgent = new Agent({
  id: 'memory-agent',
  name: 'Memory Agent',
  instructions: 'You remember what the user tells you.',
  model: 'openai/gpt-6.1-sol',
  memory: new Memory({ options: { lastMessages: 20 } }),
})

await memoryAgent.generate('My favorite color is blue.', {
  memory: { resource: 'user-123', thread: 'conversation-123' },
})

const reply = await memoryAgent.generate("What's my favorite color?", {
  memory: { resource: 'user-123', thread: 'conversation-123' },
})
```

Rules:
- Memory needs a storage provider. Add one on the Mastra instance, for example `new LibSQLStore({ id: 'mastra-storage', url: ':memory:' })` from `@mastra/libsql`. Give it an `id`.
- A thread's owner (`resource`) cannot change after creation. Do not reuse a thread ID across owners.
- Observational Memory (`new Memory({ options: { observationalMemory: true } })`) compresses long history. It needs a `threadId` when the scope is thread. With it enabled, `lastMessages` does nothing.
- Call `await memory.settled()` before shutdown when async buffering is on, or pending work is lost.

## 6. Workflows

Use a workflow when the steps and their order are known in advance. Use an agent when the model should decide the steps.

```typescript
import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'

const formatStep = createStep({
  id: 'format-step',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ formatted: z.string() }),
  execute: async ({ inputData }) => ({ formatted: inputData.message.toUpperCase() }),
})

export const testWorkflow = createWorkflow({
  id: 'test-workflow',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ formatted: z.string() }),
})
  .then(formatStep)
  .commit()
```

Register it on the Mastra instance (`workflows: { testWorkflow }`), then run it:

```typescript
const workflow = mastra.getWorkflow('testWorkflow')
const run = await workflow.createRun()

const result = await run.start({ inputData: { message: 'hello' } })
if (result.status === 'success') console.log(result.result)
```

Rules:
- Check `result.status` before reading output. Statuses are `success`, `failed`, `suspended`, `tripwire`, and `paused`.
- Pass shared values through workflow `stateSchema` and `setState`, not through every step's schema.
- Use `.branch()` and `.parallel()` for control flow, per https://mastra.ai/docs/workflows/control-flow.md.
- Call an agent from a step with `mastra?.getAgent('name')`. Pipe `stream.textStream` into `writer` to stream output.
- Use `.getWorkflow('key')` with the registration key, not the `id`, for full types.

## 7. Dev Loop

- `npm run dev` starts the local server and Mastra Studio at `http://localhost:4111`. Use Studio to chat with agents, run workflows, and read traces.
- `npx mastra api tool execute <tool-id> '{"location":"SF"}'` runs a tool against the local server.
- `npx mastra api workflow run start <workflow-id> '{"inputData":{...}}'` runs a workflow.
- Traces show every model call, tool call, and token count. Use them to debug prompts and tool choices.

## Common Mistakes

- Using `provider:model` or a provider object. Use `provider/model`.
- Writing a plain object as a tool. Use `createTool()`.
- Setting a custom `url` to a full endpoint path. Use the base URL ending in `/v1`.
- Parsing `response.text` for structured data. Use `response.object`.
- Calling memory without a `resource` and `thread`, or changing a thread's owner.
- Missing the storage provider when memory is enabled.
- Forgetting `.commit()` on a workflow, or `.then()` steps with mismatched schemas.
- Using CommonJS, or missing `"type": "module"`.
- Hardcoding API keys. Use environment variables.

## Verification Checklist

- [ ] `@mastra/core` installs and imports resolve with `"type": "module"` and ES2022 modules.
- [ ] The model is `provider/model`, or an `{ id, url }` object pointing at a base URL ending in `/v1`.
- [ ] The provider key is in an environment variable.
- [ ] Every tool uses `createTool()` with `inputSchema` and `description`.
- [ ] Memory calls pass `resource` and `thread`, and a storage provider is configured.
- [ ] Workflows call `.commit()`, and callers check `result.status`.
- [ ] One `generate()` call against the real model succeeds before building on it.
