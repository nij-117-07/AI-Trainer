# Roadmap Generator API

Base path: `/learning/roadmap`
Tag: `Roadmap Generator`

## Endpoints

### `POST /learning/roadmap/generate`

Generates an AI expert persona prompt and a list of main topics for a learning roadmap.

**Request body** (`RoadmapRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | `string` | ✅ | The learning topic (e.g., "UI/UX Design") |
| `start_level` | `string` | ✅ | Current proficiency (e.g., "Beginner") |
| `target_level` | `string` | ✅ | Desired proficiency (e.g., "Professional") |
| `mode` | `string` | ❌ | One of: `detailed`, `short` (default: `detailed`) |
| `persona_style` | `string` | ❌ | Persona style, e.g., `academic`, `industry expert` (default: `industry expert`) |
| `user_instructions` | `string` | ❌ | Refinement instructions (e.g., "Add more focus on Figma prototyping") |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/roadmap/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "subject": "UI/UX Design",
    "start_level": "Beginner",
    "target_level": "Professional",
    "mode": "detailed",
    "persona_style": "academic",
    "user_instructions": "Add more focus on Figma prototyping"
  }'
```

**Response** (`RoadmapResponse`):

```json
{
  "generated_persona_prompt": "You are an industry-leading UI/UX educator...",
  "main_topics": ["Design Fundamentals", "Typography", "Color Theory"],
  "status": "success"
}
```

---

### `POST /learning/roadmap/expand-topic`

Deep-dives into a single module of the roadmap, generating subtopics and a mastery milestone.

**Request body** (`SubtopicRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `persona` | `string` | ✅ | The generated persona prompt from `/generate` |
| `subject` | `string` | ✅ | The main learning topic (e.g., "UI/UX Design") |
| `target_level` | `string` | ✅ | Desired proficiency (e.g., "Professional") |
| `full_topic_list` | `array[string]` | ✅ | All main topics from the roadmap |
| `current_module` | `string` | ✅ | The specific topic to expand |
| `mode` | `string` | ❌ | One of: `detailed`, `short` (default: `detailed`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/roadmap/expand-topic \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "persona": "You are an industry-leading UI/UX educator...",
    "subject": "UI/UX Design",
    "target_level": "Professional",
    "full_topic_list": ["Design Fundamentals", "Typography", "Color Theory"],
    "current_module": "Typography",
    "mode": "detailed"
  }'
```

**Response** (`SubtopicResponse`):

```json
{
  "topic": "Typography",
  "subtopics": ["Type anatomy", "Hierarchy & scale", "Readability best practices"],
  "milestone": "Redesign a landing page using a 3-typeface system",
  "status": "success"
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
  "detail": "Failed to generate the learning roadmap."
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
| `MODEL_NATIVE_COT` | `false` | When `true`, the LLM natively reasons, so `Predict` is used instead of DSPy `ChainOfThought` |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `RoadmapSession`

Data contract for tracking a generated roadmap (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `subject` | `string` | The learning topic |
| `start_level` | `string` | Current proficiency |
| `target_level` | `string` | Desired proficiency |
| `mode` | `string` | Roadmap comprehensiveness |
| `generated_persona_prompt` | `string` | The AI persona system prompt |
| `main_topics` | `array[string]` | High-level chapters |
| `created_at` | `datetime` | Session creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the session is ongoing |
