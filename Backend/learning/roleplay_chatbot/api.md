# Roleplay Chatbot API

Base path: `/learning/roleplay_chatbot`
Tag: `Roleplay Chatbot`

## Overview

A DSPy-driven, character-based roleplay chatbot. Each turn receives the character's persona (`system_prompt`), the full conversation history, and the user's latest message, then produces an in-character reply along with an emotion tag and action description.

The module is **stateless**: it keeps no session state. A separate session/memory app persists the `system_prompt`, `character_name`, and the growing `chat_history`, passing them back with each turn.

## Flow

1. Call `POST /chat` with `system_prompt` + `user_input` (optionally `history`, `character_name`, and `temperature`)
2. Persist the response (append as an `assistant` message to `chat_history`) and display the emotion/action metadata
3. Loop for the next turn, passing the updated `chat_history` back

---

## Endpoints

### `POST /learning/roleplay_chatbot/chat`

Generates an in-character response for the current roleplay turn.

**Request body** (`RoleplayChatRequest`):

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `system_prompt` | `string` | Yes | — | The character's full persona definition (personality, backstory, speech style, rules) |
| `history` | `array[object]` | No | `[]` | Previous `{role, content}` turns |
| `user_input` | `string` | Yes | — | The most recent message from the user |
| `character_name` | `string` | No | `"Character"` | Display name of the character (used in history formatting) |
| `temperature` | `number` | No | `0.8` | Sampling temperature (0.0–2.0); higher = more expressive |

**Example request**:

```bash
curl -X POST http://localhost:8000/learning/roleplay_chatbot/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "system_prompt": "You are Elara Nightwhisper, a mysterious elven mage from the ancient forest of Thalendril. You are over 800 years old but appear as a young woman with silver hair and violet eyes. You speak in a slightly formal, archaic manner and use metaphors related to nature, stars, and time.",
    "history": [
      {"role": "user", "content": "Hello! Who are you?"},
      {"role": "assistant", "content": "*bows gracefully* Ah, a new face in these woods. I am Elara Nightwhisper, keeper of the ancient groves."}
    ],
    "user_input": "What brings you to this forest?",
    "character_name": "Elara",
    "temperature": 0.8
  }'
```

**Response** (`RoleplayChatResponse`):

```json
{
  "response": "*tilts head with a curious smile* I could ask you the same, traveler. These woods do not often welcome mortals... yet something about your presence feels familiar, like a half-remembered dream.",
  "emotion": "curious",
  "action": "tilts head with a curious smile",
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
| `500` | `Failed to generate the character response.` | Internal AI processing failure |

## Authentication

Optional `X-API-Key` header. When `API_KEY` is set in the environment, the server rejects requests without a matching key. When blank, the guard is disabled.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature (roleplay chat uses `0.8`) |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `RoleplayChatSession`

Persistence contract for a roleplay chat session, managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `system_prompt` | `string` | The character's persona definition |
| `character_name` | `string` | Display name of the character |
| `chat_history` | `array[object]` | All previous `{role, content}` turns |
| `created_at` / `updated_at` | `datetime` | Timestamps |
| `is_active` | `bool` | Whether the session is active |

---

## Implementation notes

- **DSPy Signature**: `RoleplayChatbot` defines three input fields (`system_prompt`, `conversation_history`, `latest_user_message`) and three output fields (`character_response`, `emotion_tag`, `action_description`).
- **History formatting**: The service converts the structured history into a `[Role]: Message` transcript before passing it to the LLM, matching the expected DSPy signature format.
- **Chain-of-thought**: The predictor uses `dspy.ChainOfThought` (or `dspy.Predict` when `MODEL_NATIVE_COT=true`) to encourage character-consistent reasoning.
