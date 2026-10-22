# Tutor Chat API

Base path: `/learning/tutor_chat`
Tag: `Tutor Chat`

## Overview

A DSPy-driven, topic-scoped tutor chatbot. Each turn reviews the master topic, respects the user's background/context, and considers the previous chat history to produce a personalized, supportive reply. Every response also includes a structured `educational_breakdown` — a list of `title`/`description` concept pairs that break the topic into digestible units.

This is distinct from the **Adaptive Tutor** (`/learning/tutor/explain`), which takes a persona `system_prompt` plus `student_level`/`learning_style` and returns a single tailored explanation. The Tutor Chat is scoped to one `master_topic` and returns a conversational reply plus a concept breakdown.

The module is **stateless**: it keeps no session state. A separate session/memory app persists the `master_topic`, `additional_context`, and the growing `chat_history`, passing them back with each turn.

## Flow

1. Call `POST /chat` with `master_topic` + `user_input` (optionally `additional_context` and prior `chat_history`)
2. Persist the `tutor_response` (append as an `assistant` message to `chat_history`) and show the `educational_breakdown`
3. Loop for the next turn, passing the updated `chat_history` back

---

## Endpoints

### `POST /learning/tutor_chat/chat`

Generates a personalized tutor response for the current turn.

**Request body** (`TutorChatRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `master_topic` | `string` | ✅ | The main subject the user wants to learn |
| `additional_context` | `string` | ❌ | User's background, goals, or learning style constraints |
| `chat_history` | `array[object]` | ❌ | Previous `{role, content}` turns |
| `user_input` | `string` | ✅ | The current question or message from the student |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/tutor_chat/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "master_topic": "Quantum Physics",
    "additional_context": "I am a high school student with a basic understanding of classical mechanics. Use analogies.",
    "chat_history": [
      {"role": "user", "content": "What is an atom?"},
      {"role": "assistant", "content": "An atom is the basic building block of matter. Now let's move to quantum mechanics."}
    ],
    "user_input": "What is Schrodinger's Cat?"
  }'
```

**Response** (`TutorChatResponse`):

```json
{
  "tutor_response": "Great question! Schrodinger's Cat is a thought experiment that shows how strange quantum rules are when scaled up...",
  "educational_breakdown": [
    { "title": "Superposition", "description": "A quantum system exists in all possible states at once until measured." },
    { "title": "The Observer Effect", "description": "Measuring a quantum system forces it into one definite state." },
    { "title": "Thought Experiments", "description": "Imaginary setups used to expose contradictions in a theory." }
  ],
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
| `500` | `Failed to generate the tutor response.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature (tutor chat uses `0.4`) |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `TutorChatSession`

Persistence contract for a tutor chat session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `master_topic` | `string` | The main subject being learned |
| `additional_context` | `string` | User's background, goals, or learning style constraints |
| `chat_history` | `array[object]` | All previous `{role, content}` turns |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |
