# Explainer API

Base path: `/learning/explainer`
Tag: `Explainer`

## Endpoints

### `POST /learning/explainer/explain`

Generates a structured explanation for a topic using AI reasoning.

**Request body** (`ExplanationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The subject to explain (e.g., "Quantum Entanglement") |
| `expertise_level` | `string` | ❌ | Required depth (any value accepted) (default: `intermediate`) |
| `context` | `string` | ❌ | Optional context or area of interest (e.g., "Use a metaphor involving shoes.") |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/explainer/explain \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Quantum Entanglement",
    "expertise_level": "beginner",
    "context": "Use a metaphor involving shoes."
  }'
```

**Response** (`ExplanationResponse`):

```json
{
  "explanation": "Quantum entanglement is a phenomenon where two particles...",
  "key_takeaway": "Entangled particles stay correlated even across large distances."
}
```

---

### `POST /learning/explainer/atoz`

Generates a high-depth, Markdown-formatted A-to-Z tutorial as a single cohesive string.

**Request body** (`TutorialRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The subject to explain (e.g., "FastAPI Architecture") |
| `expertise_level` | `string` | ✅ | Required depth (any value accepted) |
| `explanation_style` | `string` | ✅ | Explanation lens (any value accepted) |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/explainer/atoz \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "FastAPI Architecture",
    "expertise_level": "intermediate",
    "explanation_style": "practical"
  }'
```

**Response** (`TutorialResponse`):

```json
{
  "full_explanation": "# FastAPI Architecture\n\n## 1. What is FastAPI?\n..."
}
```

---

### `POST /learning/explainer/atozpointer`

Generates a structured A-to-Z roadmap with concept pointers. Ideal for structured learning paths.

**Request body** (`AtoZRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The subject or concept (e.g., "UI vs UX differences") |
| `expertise_level` | `string` | ✅ | Required depth (any value accepted) |
| `explanation_style` | `string` | ✅ | Explanation lens (any value accepted) |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/explainer/atozpointer \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "UI vs UX differences",
    "expertise_level": "beginner",
    "explanation_style": "conceptual"
  }'
```

**Response** (`AtoZResponse`):

```json
{
  "summary": "UI and UX are two sides of the same product experience...",
  "knowledge_roadmap": [
    { "concept": "Definition of UI", "explanation": "UI is the visual layer..." }
  ],
  "practical_takeaway": "Start with UX research, then craft the UI."
}
```

---

### `POST /learning/explainer/feynman`

Simplifies complex concepts using metaphors and child-friendly language (Feynman Technique).

**Request body** (`FeynmanRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `complex_topic` | `string` | ✅ | The jargon-heavy concept (e.g., "Quantum Entanglement") |
| `target_age` | `integer` | ❌ | Age level for the rewrite, `3`–`25` (default: `5`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/explainer/feynman \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "complex_topic": "Quantum Entanglement",
    "target_age": 5
  }'
```

**Response** (`FeynmanResponse`):

```json
{
  "explanation": "Imagine two magic shoes: if you put one on, the other one...",
  "key_metaphors": ["magic shoes", "invisible string"],
  "fun_analogy": "Imagine if every time you found a left shoe, a right shoe appeared across the world."
}
```

---

### `POST /learning/explainer/orchestrate-stream`

Streams a comprehensive A-to-Z journey via Server-Sent Events (SSE). Emits a `plan` event with all chapter titles, then a `chapter` event per deep-dive, then a `done` event.

**Request body** (`OrchestratorRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The subject to cover (e.g., "Calculus") |
| `expertise` | `string` | ❌ | Depth level, e.g., `Undergraduate`, `PhD`, `Hobbyist` (default: `Undergraduate`) |

**Example request**:

```bash
curl -N -X POST http://localhost:8000/learning/explainer/orchestrate-stream \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Calculus",
    "expertise": "Undergraduate"
  }'
```

**Response**: `text/event-stream` of JSON event payloads.

```json
{"event": "plan", "data": {"titles": ["Limits", "Derivatives", "Integrals"], "prerequisites": ["Algebra", "Functions"]}}
{"event": "chapter", "data": {"index": 1, "title": "Limits", "content": "...", "analogy": "...", "jargon": ["epsilon", "convergence"]}}
{"event": "done", "data": "Journey complete."}
```

---

### `POST /learning/explainer/socratic-mentor`

Triggers a Socratic session that challenges the learner's understanding through discovery rather than explanation.

**Request body** (`SocraticRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The core subject to master (e.g., "Supply and Demand Equilibrium") |
| `context` | `string` | ✅ | Background material or text |
| `user_instructions` | `string` | ❌ | Special constraints or focus areas |
| `level` | `string` | ❌ | Depth level (any value accepted) (default: `intermediate`) |
| `question_category` | `string` | ✅ | Cognitive framework for the questions (any value accepted) |
| `num_questions` | `integer` | ❌ | Number of questions, `1`–`10` (default: `3`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/explainer/socratic-mentor \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Supply and Demand Equilibrium",
    "context": "Prices are set where quantity supplied equals quantity demanded.",
    "level": "intermediate",
    "question_category": "counterfactual",
    "num_questions": 3
  }'
```

**Response** (`SocraticResponse`):

```json
{
  "pedagogical_goal": "The learner realizes that price is a coordination signal...",
  "question_category": "counterfactual",
  "questions_for_discovery": [
    {
      "question_text": "What would happen if prices were fixed by law?",
      "cognitive_challenge": "Questioning market assumptions",
      "guiding_hint": "Think about who loses first when signals are removed."
    }
  ]
}
```

---

### `POST /learning/explainer/curriculum-path`

Initializes a personalized learning roadmap that connects the user's past learning with new material to find the "Crux" of mastery.

**Request body** (`LearningPathRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The main topic to learn (e.g., "Asynchronous Python (asyncio)") |
| `context` | `string` | ✅ | Source material, documents, or raw text |
| `past_learning` | `string` | ✅ | Summary of what the user already knows |
| `user_level` | `string` | ✅ | User's knowledge level (any value accepted) |
| `user_hopes` | `string` | ✅ | What the user wants to achieve today |
| `additional_instructions` | `string` | ❌ | Extra constraints (e.g., "keep it brief") |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/explainer/curriculum-path \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Asynchronous Python (asyncio)",
    "context": "Official asyncio docs",
    "past_learning": "Comfortable with threads in Python",
    "user_level": "intermediate",
    "user_hopes": "I want to build a concurrent HTTP fetcher.",
    "additional_instructions": "Use real-world examples."
  }'
```

**Response** (`LearningPathResponse`):

```json
{
  "session_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "rationale": "You already know threads; asyncio builds on the same mental model...",
  "the_crux": "Cooperative multitasking beats preemptive for I/O-bound work.",
  "learning_roadmap": [
    {
      "phase": "Bridge",
      "description": "Compare threads vs. the event loop",
      "learning_objective": "Map thread idioms onto asyncio coroutines"
    }
  ],
  "suggested_focus": "Write one async HTTP fetch and profile it."
}
```

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to <action>.` | Internal AI processing failure |

**Example 500:**

```json
{
  "detail": "Failed to generate the explanation."
}
```

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `ExplanationSession`

Data contract for tracking an explanation session (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `topic` | `string` | The subject that was explained |
| `expertise_level` | `string` | Target audience knowledge level |
| `explanation` | `string` | The generated explanation content |
| `key_takeaway` | `string` | One-sentence summary of the core concept |
| `created_at` | `datetime` | Session creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the session is ongoing |
