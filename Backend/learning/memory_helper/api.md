# Memory Helper API

Base path: `/learning/memory_helper`
Tag: `Memory Specialist`

## Endpoints

### `POST /learning/memory_helper/process`

Transforms complex data into structured mnemonics and a retention plan.

**Request body** (`MemoryRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The facts or data to memorize (min 5 characters) |
| `technique` | `string` | ❌ | Preferred mnemonic technique (default: `Best Fit`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/memory_helper/process \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Photosynthesis produces glucose from CO2, water, and sunlight",
    "technique": "Method of Loci"
  }'
```

**Response** (`MemoryResponse`):

```json
{
  "explanation": "Method of Loci works because spatial memory is stronger than rote memory...",
  "memory_hooks": [
    {
      "concept": "Glucose",
      "hook": "A glowing sugar cube inside your memory palace kitchen"
    },
    {
      "concept": "CO2",
      "hook": "A carbon dioxide fire extinguisher on the wall"
    }
  ],
  "retention_plan": "1. Review the palace walk tonight. 2. Quiz yourself in 2 days. 3. Teach it to someone in a week."
}
```

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to process the memory request.` | Internal AI generation failure |

**Example 500:**

```json
{
  "detail": "Failed to process the memory request."
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

### `MemorySession`

Data contract for tracking a generated mnemonic session (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique memory session identifier |
| `topic` | `string` | The facts or data the user wanted to memorize |
| `technique` | `string` | The mnemonic technique used |
| `explanation` | `string` | Why the technique works for this data |
| `memory_hooks` | `array[MemoryHookRecord]` | The concept-to-hook mappings |
| `retention_plan` | `string` | The review plan to retain the information |
| `created_at` | `datetime` | Generation timestamp |
| `is_active` | `bool` | Whether the session is active |

### `MemoryHookRecord`

| Field | Type | Description |
|-------|------|-------------|
| `concept` | `string` | The specific piece of info |
| `hook` | `string` | The mnemonic or mental image |
