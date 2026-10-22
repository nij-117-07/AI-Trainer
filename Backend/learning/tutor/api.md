# Adaptive Tutor API

Base path: `/learning/tutor`
Tag: `Adaptive Tutor`

## Endpoints

### `POST /learning/tutor/explain`

Generates an adaptive pedagogical explanation for a student query.

**Request body** (`TutorRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `system_prompt` | `string` | ✅ | The persona and pedagogical rules |
| `user_query` | `string` | ✅ | The student's specific question or struggle |
| `student_level` | `string` | ✅ | Proficiency level (e.g. Toddler, High School, Expert) |
| `learning_style` | `string` | ✅ | Preferred framing (analogical, first_principles, etc.) |
| `current_scenario` | `string` | ✅ | Learning context (e.g. "preparing for an exam") |
| `chat_history` | `array[ChatMessage]` | ❌ | Previous conversation turns (default: `[]`) |
| `last_topic_taught` | `string` | ❌ | Context of the previous lesson |

`ChatMessage: { role: string, content: string }`

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/tutor/explain \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "system_prompt": "You are a patient Socratic tutor.",
    "user_query": "Why does water boil at 100C?",
    "student_level": "High School",
    "learning_style": "analogical",
    "current_scenario": "preparing for an exam",
    "chat_history": [],
    "last_topic_taught": "states of matter"
  }'
```

**Response** (`TutorResponse`):

```json
{
  "adapted_explanation": "Water boils when its vapor pressure equals atmospheric pressure...",
  "concept_analogy": "Think of water molecules as runners trying to escape a stadium...",
  "tutor_feedback": "What happens to the boiling point at high altitude?"
}
```

---

### `POST /learning/tutor/prompts`

Creates or updates a prompt template (stored as a YAML file).

**Request body** (`PromptCreateUpdate`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ✅ | Unique identifier (used as filename) |
| `content` | `string` | ✅ | The system prompt text |

**Response** `201` (`PromptActionResponse`):

```json
{ "message": "Prompt 'socratic_tutor' created/updated successfully" }
```

---

### `GET /learning/tutor/prompts`

Lists all available prompt template names.

**Response** `200`:

```json
["Socratic", "cheerful_coach", "socratic_tutor"]
```

---

### `GET /learning/tutor/prompts/{name}`

Retrieves a single prompt template by name.

**Response** `200` (`PromptResponse`):

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Prompt identifier |
| `content` | `string` | Prompt body text |
| `created_at` | `datetime` | Creation timestamp (ISO-8601) |
| `updated_at` | `datetime` | Last-update timestamp (ISO-8601) |

---

### `PUT /learning/tutor/prompts/{name}`

Updates a prompt template.

**Request body:** Same as POST (`name` + `content`).

**Response** `200`:

```json
{ "message": "Prompt 'socratic_tutor' updated successfully" }
```

---

### `DELETE /learning/tutor/prompts/{name}`

Deletes a prompt template file.

**Response** `204`: No content.

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `404` | `Prompt not found` | Requested prompt template does not exist |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Tutor engine failed to process the request.` | DSPy generation failed |
| `500` | `Error accessing prompt file` | Prompt template could not be read/written |

**Example 500:**

```json
{
  "detail": "Tutor engine failed to process the request."
}
```

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `TUTOR_PROMPTS_DIR` | *(blank → `learning/tutor/prompts`)* | Directory for prompt template YAML files |
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `PromptFile`

Data contract for a persisted prompt template (YAML document).

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Unique identifier for the prompt |
| `content` | `string` | The system prompt text |
| `created_at` | `datetime` | Creation timestamp |
| `updated_at` | `datetime` | Last-update timestamp |
