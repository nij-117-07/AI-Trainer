# Language Tester API

Base path: `/linguistic/language_tester`
Tag: `Language Assessment`

## Endpoints

### `POST /linguistic/language_tester/generate`

Generates a personalized MCQ assessment based on CEFR level and scenario.

**Request body** (`AssessmentRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target_language` | `string` | ✅ | The language being tested |
| `native_language` | `string` | ❌ | User's native language (default: `English`) |
| `level` | `string` | ✅ | CEFR level: `A1`, `A2`, `B1`, `B2`, `C1`, `C2` |
| `num_questions` | `integer` | ❌ | Question count (1-10, default: 5) |
| `scenario` | `string` | ✅ | Context for the questions |
| `user_details` | `string` | ✅ | Persona info to personalize questions |
| `seed` | `string` | ❌ | Seed for variety |
| `custom_instructions` | `string` | ❌ | Specific focus (e.g., "only use past tense") |

```bash
curl -X POST http://localhost:8000/linguistic/language_tester/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "target_language": "Spanish",
    "native_language": "English",
    "level": "B1",
    "num_questions": 5,
    "scenario": "Booking a hotel room",
    "user_details": "A business traveler",
    "seed": "hotel_b1_1",
    "custom_instructions": null
  }'
```

**Response** (`AssessmentResponse`): `{ "assessment_title": str, "level_rationale": str, "questions": [MCQQuestion] }`

### `POST /linguistic/language_tester/fib/generate`

Creates "Fill in the Blank" questions based on CEFR level and scenario.

**Request body** (`FIBRequest`): `target_language`, `level` (CEFR), `num_questions` (1-10), `scenario`, `user_details`, `seed`.
**Response** (`FIBResponse`): `{ "questions": [FIBQuestion] }`

```bash
curl -X POST http://localhost:8000/linguistic/language_tester/fib/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "target_language": "German",
    "level": "A2",
    "num_questions": 3,
    "scenario": "At the pharmacy",
    "user_details": "A nurse",
    "seed": "pharma_a2"
  }'
```

### `POST /linguistic/language_tester/fib/evaluate`

Evaluates a user's answer for typos, correctness, and grammar.

**Request body** (`EvaluationRequest`): `sentence_context`, `correct_word`, `user_answer`.
**Response** (`EvaluationResponse`): `{ "is_correct": bool, "status": "correct"|"typo"|"incorrect", "feedback": str, "improvement_tip": str|null }`

```bash
curl -X POST http://localhost:8000/linguistic/language_tester/fib/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "sentence_context": "Ich ____ (gehen) nach Hause.",
    "correct_word": "gehe",
    "user_answer": "geeh"
  }'
```

### `POST /linguistic/language_tester/translation/challenge`

Generates an Active or Passive translation challenge. The test type is chosen deterministically from the seed.

**Request body** (`TranslationChallengeRequest`): `target_language`, `native_language`, `level` (CEFR), `scenario`, `user_persona`, `seed`, `custom_instructions`.
**Response** (`TranslationChallengeResponse`): `{ "test_type": "translate_to_target"|"translate_to_native"|"explain_meaning", "challenge_instruction": str, "source_text": str, "correct_reference": str, "vocabulary_highlights": [str], "cultural_tip": str|null }`

### `POST /linguistic/language_tester/roleplay/continue`

Processes the latest user message in a conversational roleplay and returns grammatical feedback plus the AI's next line.

**Request body** (`RoleplayRequest`): `target_language`, `level` (CEFR), `scenario`, `user_persona`, `chat_history` (`[{role, content}]`), `user_latest_response`, `seed`.
**Response** (`RoleplayResponse`): `{ "linguistic_critique": str, "fluency_score": int (1-10), "ai_character_response": str, "suggested_strategies": [str], "is_goal_achieved": bool }`

---

## Error responses

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
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

---

## Shared models

### `AssessmentRecord`

Data contract for tracking a generated assessment (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique assessment identifier |
| `target_language` | `string` | The language being tested |
| `native_language` | `string` | The user's native language |
| `level` | `string` | CEFR proficiency level |
| `scenario` | `string` | Context of the assessment |
| `assessment_title` | `string` | The generated test title |
| `num_questions` | `integer` | Number of questions generated |
| `seed` | `string` | Seed used for generation |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
