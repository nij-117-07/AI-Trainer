# Flexible Writer API

Base path: `/tools/flexible_writer`
Tag: `Flexible Writer`

## Overview

A single-endpoint DSPy agent that adopts any persona or rule set provided via a system prompt, then processes or transforms the input data according to the user's instructions. It is intentionally generic: the client decides *what* the agent is and *what* it should do.

The backend is **stateless**: it keeps no history. The client is responsible for passing the persona, the data, and any required context on every call.

## Endpoints

### `POST /tools/flexible_writer/transform`

Processes or transforms the input data under a system-prompt-defined persona.

**Request body** (`FlexibleWriterRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `system_prompt` | `string` | ✅ | The core persona and rules for the AI |
| `input_data` | `any` | ✅ | The primary data/content to process or transform |
| `additional_user_input` | `string` | ❌ | Specific instructions or context from the user |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/flexible_writer/transform \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "system_prompt": "You are a strict AP-style copy editor. Rewrite text for clarity and concision.",
    "input_data": "The reason why we was unable to complete the task was due to the fact that it was raining.",
    "additional_user_input": "Make it under 12 words."
  }'
```

**Response** (`FlexibleWriterResponse`):

```json
{
  "answer_message": "Rewrote the sentence in AP style, cutting it to 11 words.",
  "updated_data": "Rain prevented us from finishing the task.",
  "status": "success"
}
```

---

## Error responses

The endpoint returns a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to transform the input data.` | Internal AI processing failure |

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

### `FlexibleWriterRecord`

Persistence contract for a transformation record, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique record identifier |
| `system_prompt` | `string` | The persona and rules used |
| `input_data` | `any` | The original input data |
| `updated_data` | `any` | The transformed result |
| `answer_message` | `string` | The conversational summary |
| `created_at` / `updated_at` | `datetime` | Timestamps |
