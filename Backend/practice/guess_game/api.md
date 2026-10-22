# Guess Game API

Base path: `/practice/guess_game`
Tag: `Guess Game`

## Overview

A DSPy-driven guessing game. The server picks a hidden mystery item, gives escalating hints, evaluates the user's guesses, and coaches them when stuck.

The module is **stateless**: it keeps no game state. A separate session/memory app stores the game state (mystery item, fun fact, hints, guesses) and passes the relevant fields back with every request. The mystery item is returned once by `/start` so the client app can persist it — it is never shown to the player before the reveal.

## Game flow

1. `POST /start` → persist `mystery_item`, `fun_fact`, `first_hint`, `max_guesses`
2. `POST /guess` / `POST /hint` / `POST /coach` (any number of times) — each carries the stored state
3. The client app reveals `mystery_item` + `fun_fact` from its own store when the game ends

---

## Endpoints

### `POST /practice/guess_game/start`

Generates a mystery item, first hint, and fun fact for a new game.

**Request body** (`GameStartRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | `string` | ✅ | One of: `word`, `movie`, `sentence`, `book`, `celebrity`, `song` |
| `difficulty` | `string` | ✅ | One of: `easy`, `medium`, `hard`, `expert` |
| `vocabulary_theme` | `string` | ❌ | Optional theme constraint (e.g., `sci-fi movies`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/guess_game/start \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "category": "movie",
    "difficulty": "medium",
    "vocabulary_theme": "sci-fi"
  }'
```

**Response** (`GameStartResponse`) — the client session app must persist these fields:

```json
{
  "mystery_item": "Inception",
  "fun_fact": "The spinning top at the end was intentionally left ambiguous.",
  "first_hint": "A film about dreams inside dreams released in 2010.",
  "max_guesses": 7,
  "message": "New MEDIUM movie game started!",
  "status": "success"
}
```

---

### `POST /practice/guess_game/guess`

Evaluates a user's guess against the mystery item.

**Request body** (`GuessRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mystery_item` | `string` | ✅ | The hidden answer stored by the client session app |
| `category` | `string` | ✅ | One of: `word`, `movie`, `sentence`, `book`, `celebrity`, `song` |
| `difficulty` | `string` | ✅ | One of: `easy`, `medium`, `hard`, `expert` |
| `guess` | `string` | ✅ | The user's attempted guess |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/guess_game/guess \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "mystery_item": "Inception",
    "category": "movie",
    "difficulty": "medium",
    "guess": "Inception"
  }'
```

**Response** (`GuessResponse`) — the client tracks remaining guesses itself:

```json
{
  "correct": true,
  "feedback": "Yes! A movie within a movie — perfectly guessed.",
  "closeness": 1.0,
  "suggestion": "",
  "status": "success"
}
```

---

### `POST /practice/guess_game/hint`

Generates the next hint without repeating previous ones.

**Request body** (`HintRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mystery_item` | `string` | ✅ | The hidden answer stored by the client session app |
| `category` | `string` | ✅ | One of: `word`, `movie`, `sentence`, `book`, `celebrity`, `song` |
| `previous_hints` | `array[string]` | ❌ | Hints already given, to avoid repetition (default: `[]`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/guess_game/hint \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "mystery_item": "Inception",
    "category": "movie",
    "previous_hints": ["A film about dreams inside dreams released in 2010."]
  }'
```

**Response** (`HintResponse`) — persist `hints_used` for the next call:

```json
{
  "hint": "Its main character carries a spinning top.",
  "encouragement": "You are getting warmer — think about what is real.",
  "hints_used": [
    "A film about dreams inside dreams released in 2010.",
    "Its main character carries a spinning top."
  ],
  "status": "success"
}
```

---

### `POST /practice/guess_game/coach`

Provides coaching guidance for a struggling player.

**Request body** (`CoachRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mystery_item` | `string` | ✅ | The hidden answer stored by the client session app |
| `category` | `string` | ✅ | One of: `word`, `movie`, `sentence`, `book`, `celebrity`, `song` |
| `failed_guesses` | `array[string]` | ✅ | Previous incorrect guesses |
| `hint_number` | `integer` | ✅ | Current hint stage (1-based) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/guess_game/coach \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "mystery_item": "Inception",
    "category": "movie",
    "failed_guesses": ["Matrix", "Avatar"],
    "hint_number": 3
  }'
```

**Response** (`CoachResponse`):

```json
{
  "coaching": "Think about films that blend dreams with reality.",
  "framework": "List the directors famous for surreal dream sequences, then cross-check the era.",
  "partial_reveal": "The title starts with 'I'.",
  "should_hint": true,
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
  "detail": "Failed to generate the next hint."
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

### `GuessGameRecord`

Persistence contract for a generated guess game setup. Managed by the client's session/memory app.

| Field | Type | Description |
|-------|------|-------------|
| `category` | `string` | What type of thing is being guessed |
| `difficulty` | `string` | Game difficulty |
| `mystery_item` | `string` | The hidden answer (never exposed before reveal) |
| `fun_fact` | `string` | Fun trivia fact shared after the reveal |
| `first_hint` | `string` | The first hint shown to the user |
| `max_guesses` | `integer` | Guesses allowed for this difficulty |
| `created_at` | `datetime` | Record creation timestamp |
| `is_active` | `bool` | Whether the game is ongoing |
