# Prompt Generator API

Base path: `/tools/prompt_generator`
Tag: `Persona Generation`

## Endpoints

### `POST /tools/prompt_generator/generate`

Generates or refines an LLM System Persona using DSPy. Supports iterative improvement via `past_prompt` and deterministic replication via `seed`.

**Request body** (`PersonaCreate`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `scenario` | `string` | ✅ | The specific use-case or domain (e.g., "Financial Advisor") |
| `context` | `string` | ❌ | Background information, target audience, or environment constraints |
| `user_instructions` | `string` | ❌ | Specific "dos and don'ts", stylistic preferences, or personality traits |
| `reference_samples` | `string[]` | ❌ | Examples of existing prompts or writing styles to emulate |
| `past_prompt` | `string` | ❌ | A previous version of the persona to iterate upon or improve (default: `""`) |
| `seed` | `string` | ❌ | Optional specific seed; otherwise a random seed is generated |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/prompt_generator/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "scenario": "Financial Advisor",
    "context": "Advises first-time investors",
    "user_instructions": "Use plain language, avoid jargon",
    "reference_samples": ["Friendly, patient tone"],
    "seed": "finadv2026"
  }'
```

**Response** (`PersonaResponse`):

```json
{
  "persona_name": "Elena the Clarity Advisor",
  "generated_persona_system_prompt": "You are Elena... ",
  "seed_used": "finadv2026"
}
```

**Response fields**:

| Field | Type | Description |
|-------|------|-------------|
| `persona_name` | `string` | Professional name for the persona |
| `generated_persona_system_prompt` | `string` | The complete system prompt |
| `seed_used` | `string` | The seed used — reuse it to replicate the result |

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the persona.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |

---

## Shared models

### `PersonaRecord`

Data contract for tracking a generated persona (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique persona generation identifier |
| `scenario` | `string` | The use-case or domain |
| `context` | `string` | Background information or constraints |
| `user_instructions` | `string` | Stylistic preferences or rules |
| `reference_samples` | `string[]` | Example prompts to emulate |
| `past_prompt` | `string` | Previous persona version iterated upon |
| `persona_name` | `string` | Generated persona name |
| `generated_persona_system_prompt` | `string` | The generated system prompt |
| `seed_used` | `string` | The seed used for reproducibility |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
