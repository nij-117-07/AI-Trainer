# Testing Portal API

Base path: `/practice/testing-portal`
Tag: `Testing Portal`

## Endpoints

### `POST /practice/testing-portal/generate-mcq`

Generates a set of multiple choice questions (MCQs) via DSPy.

**Request body** (`MCQRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The subject for the questions (e.g., "Python Concurrency") |
| `question_type` | `string` | ✅ | Any question style (e.g., `academic`, `practical`, `scenario-based`, `conceptual`, `recall`) |
| `num_questions` | `integer` | ✅ | Number of MCQs to generate (1–10) |
| `difficulty_level` | `string` | ✅ | Any complexity level (e.g., `beginner`, `intermediate`, `advanced`, `expert`) |
| `context_setting` | `string` | ✅ | The scenario (e.g., "Senior Backend Engineer Interview") |
| `past_questions` | `array[string]` | ❌ | List of previous question texts to avoid repetition |
| `custom_instructions` | `string` | ❌ | Specific user requirements |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/testing-portal/generate-mcq \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Python Concurrency",
    "question_type": "practical",
    "num_questions": 3,
    "difficulty_level": "advanced",
    "context_setting": "Senior Backend Engineer Interview",
    "past_questions": [
      "Explain the GIL.",
      "Compare asyncio and threads."
    ],
    "custom_instructions": "Focus on GIL trade-offs"
  }'
```

**Response** (`MCQResponse`):

```json
{
  "questions": [
    {
      "question_text": "Which construct avoids the GIL during parallel CPU-bound work?",
      "options": {
        "A": "ThreadPoolExecutor",
        "B": "multiprocessing.Process",
        "C": "asyncio.gather",
        "D": "gevent"
      },
      "correct_answer": "B"
    }
  ],
  "status": "success"
}
```

---

### `POST /practice/testing-portal/generate-theoretical`

Generates open-ended, theoretical, or scenario-based questions via DSPy.

**Request body** (`TheoreticalRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The subject or domain (e.g., "Microservices") |
| `question_type` | `string` | ✅ | Any question style (e.g., `academic`, `practical`, `case-study`, `philosophical`, `architectural`) |
| `source_context` | `string` | ❌ | Source text/data for analysis |
| `num_questions` | `integer` | ✅ | Number of questions to generate (1–5) |
| `difficulty_level` | `string` | ✅ | Any depth level (e.g., `basic`, `intermediate`, `advanced`, `architectural`) |
| `context_setting` | `string` | ✅ | The scenario (e.g., "High-Tech Enterprise Interview") |
| `past_questions` | `array[string]` | ❌ | List of previous question texts to ensure variety |
| `custom_instructions` | `string` | ❌ | Specific constraints |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/testing-portal/generate-theoretical \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Microservices",
    "question_type": "architectural",
    "num_questions": 2,
    "difficulty_level": "advanced",
    "context_setting": "High-Tech Enterprise Interview",
    "past_questions": ["Compare saga vs two-phase commit."],
    "custom_instructions": "Focus on speed vs consistency."
  }'
```

**Response** (`TheoreticalResponse`):

```json
{
  "questions": [
    {
      "question_text": "Compare the consistency guarantees of saga vs. two-phase commit in distributed transactions.",
      "focus_area": "Distributed Systems",
      "evaluation_criteria": "Covers trade-offs, failure modes, and when each is appropriate"
    }
  ],
  "status": "success"
}
```

---

### `POST /practice/testing-portal/generate-answer`

Acts as a Subject Matter Expert to generate a comprehensive answer to a high-level question.

**Request body** (`AnswerRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | `string` | ✅ | The question to answer |
| `context` | `string` | ✅ | The setting (e.g., "Job Interview for Senior Developer") |
| `difficulty` | `string` | ✅ | Complexity of the expected answer (e.g., "Expert") |
| `response_format` | `string` | ✅ | Any structural style (e.g., `bullet_points`, `paragraph`, `step_by_step`, `technical_whitepaper`) |
| `custom_instructions` | `string` | ❌ | Additional constraints or information |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/testing-portal/generate-answer \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "question": "Explain Consensus Mechanisms in Blockchain.",
    "context": "Job Interview for Senior Developer",
    "difficulty": "Expert",
    "response_format": "bullet_points",
    "custom_instructions": "Compare PoW, PoS, and PBFT."
  }'
```

**Response** (`AnswerResponse`):

```json
{
  "answer_text": "Consensus mechanisms coordinate agreement across untrusted nodes...",
  "key_concepts_covered": ["Proof of Work", "Proof of Stake", "Byzantine Fault Tolerance"],
  "status": "success"
}
```

---

### `POST /practice/testing-portal/solve-mcq`

Analyzes an existing MCQ, determines the correct option (A–D), and provides reasoning.

**Request body** (`MCQSolverRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | `string` | ✅ | The text of the question |
| `options` | `object` | ✅ | Map of option letters to text (e.g., `{"A": "...", "B": "..."}`) |
| `context` | `string` | ❌ | The scenario for the question |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/testing-portal/solve-mcq \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "question": "What is the primary function of the mitochondria?",
    "options": {
      "A": "Protein synthesis",
      "B": "ATP production",
      "C": "Storage",
      "D": "Waste"
    },
    "context": "High School Biology Quiz"
  }'
```

**Response** (`MCQSolverResponse`):

```json
{
  "correct_option": "B",
  "reasoning": "The mitochondria convert chemical energy into ATP via cellular respiration.",
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
  "detail": "Failed to generate MCQs."
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
| `PAST_QUESTIONS_LIMIT` | `8` | How many of the most recent past questions to consider |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |

---

## Shared models

### `TestingPortalSession`

Data contract for tracking a testing session (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `topic` | `string` | The subject or domain of the session |
| `context_setting` | `string` | The scenario for the questions |
| `generated_mcqs` | `array[object]` | Generated multiple choice questions |
| `generated_theoretical` | `array[object]` | Generated theoretical questions |
| `created_at` | `datetime` | Session creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the session is ongoing |
