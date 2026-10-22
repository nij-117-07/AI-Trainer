# Roleplay Module API

Base path: `/linguistic/roleplay_module`
Tag: `Roleplay AI`

## Endpoints

### `POST /linguistic/roleplay_module/chat`

Interacts with the Roleplay Chatbot using the request's system prompt.

**Request body** (`RoleplayRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `system_prompt` | `string` | ✅ | The core persona traits |
| `history` | `array[ChatMessage]` | ❌ | Previous messages `[{role, content}]` |
| `message` | `string` | ✅ | The latest message from the user |
| `language` | `string` | ❌ | The conversation language (default: `English`) |
| `seed` | `string` | ✅ | Unique session identifier for consistency |
| `additional_instructions` | `string` | ❌ | Constraints for this turn (default: "Be creative.") |

**Response** (`RoleplayResponse`): `{ "response_message": str, "status": "success" }`

```bash
curl -X POST http://localhost:8000/linguistic/roleplay_module/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "system_prompt": "You are a grumpy Parisian waiter.",
    "history": [],
    "message": "Good evening! A table for two, please.",
    "language": "French",
    "seed": "session_001",
    "additional_instructions": "Be sarcastic but helpful."
  }'
```

### `POST /linguistic/roleplay_module/chat/stored/{name}`

Chats using a pre-saved persona from YAML (overrides the request prompt).

**Path parameter**: `name` — the stored persona name.
**Request body**: same `RoleplayRequest` (its `system_prompt` is ignored).
**Response**: `RoleplayResponse`
**Errors**: `404` if the persona does not exist.

### `POST /linguistic/roleplay_module/roles`

Creates a new roleplay persona.

**Request body** (`RoleplayRecord`): `{ "name": str, "prompt": str }`
**Response**: `RoleplayRecord` (201)
**Errors**: `400` if the persona already exists.

```bash
curl -X POST http://localhost:8000/linguistic/roleplay_module/roles \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{"name": "grumpy_waiter", "prompt": "You are a grumpy Parisian waiter."}'
```

### `GET /linguistic/roleplay_module/roles`

Lists all available role names.
**Response**: `["grumpy_waiter", ...]`

### `GET /linguistic/roleplay_module/roles/{name}`

Gets the persona by name. **Errors**: `404` if missing.

### `PATCH /linguistic/roleplay_module/roles/{name}`

Updates the persona prompt. **Request body** (`RoleplayUpdate`): `{ "prompt": str }`. **Errors**: `404` if missing.

### `DELETE /linguistic/roleplay_module/roles/{name}`

Deletes a persona. Returns `204 No Content`. **Errors**: `404` if missing.

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `404` | `Role not found` | Requested persona does not exist |
| `400` | `Role already exists` | Creating a duplicate persona |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to process the roleplay request.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature |
| `ROLEPLAY_STORAGE_DIR` | `Data/Linguistic/Roleplays` | Directory storing roleplay personas (YAML) |

---

## Shared models

### `RoleplaySession`

Data contract for tracking a roleplay conversation (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `persona_name` | `string` | The persona used in the session |
| `language` | `string` | The conversation language |
| `history` | `array[object]` | The conversation history |
| `seed` | `string` | Session seed for consistency |
| `created_at` | `datetime` | Session creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the session is active |
