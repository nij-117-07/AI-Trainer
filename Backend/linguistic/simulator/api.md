# Simulator API

Base path: `/linguistic/simulator`
Tag: `Behavioral Simulation`

## Endpoints

### `POST /linguistic/simulator/run`

Triggers a new behavioral simulation based on persona and scenario.

**Request body** (`SimulationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `persona` | `string` | ✅ | The persona to embody |
| `scenario` | `string` | ✅ | The setting or situation |
| `user_input` | `string` | ✅ | The dialogue directed at the persona |
| `additional_context` | `string` | ❌ | Extra background info, history, or environmental factors |

```bash
curl -X POST http://localhost:8000/linguistic/simulator/run \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "persona": "A pragmatic retired starship captain.",
    "scenario": "Oxygen levels at 15%. Distress signal detected.",
    "user_input": "Captain, we must help them!",
    "additional_context": "Crew morale is low."
  }'
```

**Response** (`SimulationResponse`): `{ "simulation_id": str, "thought_process": str, "chosen_action": str, "response_dialogue": str, "emotional_state": str }`

### `POST /linguistic/simulator/chat`

Maintains a situational conversation turn.

**Request body** (`ChatRequest`): `persona`, `scenario`, `user_input`, `chat_history` (`[{role, content}]`).
**Response** (`ChatResponse`): `{ "thought": str, "dialogue": str, "updated_history": [ChatMessage] }`

```bash
curl -X POST http://localhost:8000/linguistic/simulator/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "persona": "You are a strict starship captain.",
    "scenario": "Distress signal detected.",
    "user_input": "Should we respond?",
    "chat_history": []
  }'
```

### `GET /linguistic/simulator/prompts`

Lists all available simulator prompt names.
**Response**: `["captain_crush", ...]`

### `POST /linguistic/simulator/prompts`

Creates a new system prompt. **Request body** (`PromptCreate`): `{ "name": str, "content": str }`. **Response** (201): confirmation message.

```bash
curl -X POST http://localhost:8000/linguistic/simulator/prompts \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{"name": "captain_crush", "content": "You are a strict, no-nonsense starship captain."}'
```

### `GET /linguistic/simulator/prompts/{name}`

Views a specific prompt's content. **Response**: `{ "name": str, "content": str }`. **Errors**: `404` if missing.

### `PUT /linguistic/simulator/prompts/{name}`

Updates an existing prompt. **Request body** (`PromptUpdate`): `{ "content": str }`. **Errors**: `404` if missing.

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `404` | `Prompt not found` | Requested prompt does not exist |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to <action>.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |
| `SIMULATOR_PROMPTS_FILE` | `Data/Linguistic/Simulator/prompts.yaml` | YAML file storing simulator prompts |

---

## Shared models

### `SimulationRecord`

Data contract for tracking a simulation run (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique simulation identifier |
| `scenario` | `string` | The setting or situation |
| `response_dialogue` | `string` | The persona's in-character response |
| `chosen_action` | `string` | The action taken by the persona |
| `emotional_state` | `string` | The persona's mood after the interaction |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
