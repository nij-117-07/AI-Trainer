# Interview Simulator API

Base path: `/practice/interview`
Tag: `Interview Simulator`

## Overview

A DSPy-driven mock interview engine with **one endpoint per DSPy signature**:

| Signature | Endpoint | Purpose |
|-----------|----------|---------|
| `SessionManager` | `POST /session/decide` | Strategic brain — picks the next action and issues a directive |
| `QuestionGenerator` | `POST /question/generate` | Executes a directive into a crafted question |
| `AnswerReviewer` | `POST /answer/review` | Scores and critiques the candidate's answer |
| `ProgressTracker` | `POST /progress/track` | Merges the review into the performance profile |

The backend is **stateless**: it keeps no session state. A separate frontend/session app owns the logic — profiles, history, scores, timer, question counter — and passes the relevant fields back on each call. The session contract in `models.py` (`InterviewSession`) mirrors the state the webapp must persist.

## Session flow (frontend orchestrates)

1. `POST /session/decide` → read `next_action`; if `end_session`, finish the interview
2. `POST /question/generate` → pass the returned `directive` (plus previous Q/A for follow-ups); show `question`; store it in `session_history` together with `all_questions_asked`
3. Candidate answers → `POST /answer/review` → show scores/feedback; store the review
4. `POST /progress/track` → persist `updated_profile` as the new `progress_state`
5. Increment `questions_asked`, decrement `time_remaining_minutes`, loop back to step 1

---

## Endpoints

### `POST /practice/interview/session/decide`

Runs the SessionManager: chooses the next strategic action and produces a directive for the question generator.

**Request body** (`SessionDecideRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `candidate_profile` | `object` | ❌ | Candidate's background, experience, skills |
| `position_details` | `object` | ❌ | Target role, company, required skills, JD |
| `interview_context` | `object` | ❌ | Interviewer role, type, round, format, time |
| `session_history` | `array[object]` | ❌ | All Q&A so far with scores and reviews (default `[]`) |
| `progress_state` | `object` | ❌ | Scores, weak/strong areas, topic coverage (default `{}`) |
| `questions_asked` | `integer` | ❌ | Questions asked so far (default `0`, min `0`) |
| `max_questions` | `integer` | ❌ | Total questions planned (default `10`, min `1`) |
| `time_remaining_minutes` | `integer` | ❌ | Minutes left (default `30`, min `0`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/interview/session/decide \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "candidate_profile": {"name": "Asha", "experience": "3 years backend"},
    "position_details": {"role": "Senior Backend Engineer", "skills": ["Python", "AWS"]},
    "interview_context": {"interviewer_role": "Tech Lead", "type": "technical", "round": "onsite", "format": "60 min live"},
    "session_history": [],
    "progress_state": {},
    "questions_asked": 2,
    "max_questions": 8,
    "time_remaining_minutes": 40
  }'
```

**Response** (`SessionDecideResponse`) — send `directive` to `/question/generate`:

```json
{
  "next_action": "new_question",
  "action_reasoning": "Core AWS knowledge is untested so far.",
  "directive": {
    "action": "new_question",
    "question_type": "system_design",
    "topic": "Design a rate limiter",
    "difficulty": "hard",
    "focus_area": "distributed counters and consistency",
    "should_reference_last_answer": false,
    "tone_guidance": "senior tech lead, conversational",
    "constraints": "Keep it under two sentences"
  },
  "status": "success"
}
```

`next_action` is one of `new_question`, `follow_up`, `switch_topic`, `end_session`.

---

### `POST /practice/interview/question/generate`

Runs the QuestionGenerator: turns a directive into the actual question plus reviewer calibration data.

**Request body** (`QuestionGenerateRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `directive` | `object` | ❌ | Directive from `/session/decide` (or a hand-built equivalent) |
| `candidate_profile` | `object` | ❌ | Candidate's background |
| `position_details` | `object` | ❌ | Target position info |
| `interview_context` | `object` | ❌ | Interviewer role, type, format, round |
| `previous_question` | `string` | ❌ | Last question asked (needed for follow-ups) |
| `previous_answer` | `string` | ❌ | Candidate's last answer (needed for follow-ups) |
| `previous_review` | `object` | ❌ | Review of the last answer |
| `all_questions_asked` | `array[string]` | ❌ | Never repeated by the generator (default `[]`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/interview/question/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "directive": {"action": "new_question", "question_type": "system_design", "topic": "Design a rate limiter", "difficulty": "hard", "focus_area": "distributed counters"},
    "candidate_profile": {"name": "Asha", "experience": "3 years backend"},
    "position_details": {"role": "Senior Backend Engineer"},
    "interview_context": {"interviewer_role": "Tech Lead", "format": "onsite"},
    "all_questions_asked": ["Tell me about a production incident you handled."]
  }'
```

**Response** (`QuestionGenerateResponse`) — show `question`, keep the rest for `/answer/review`:

```json
{
  "question": "Design a rate limiter for an API gateway serving 50k requests per second across 200 edges — how do you keep the counters consistent without a central bottleneck?",
  "topic": "distributed rate limiting",
  "difficulty": "hard",
  "expected_keywords": ["sliding window", "sharded counters", "approximation vs accuracy"],
  "evaluation_criteria": "Great answers quantify throughput, discuss consistency trade-offs, and name failure modes.",
  "red_flags": ["I'd just use Redis without sizing it", "no mention of hot keys"],
  "sample_strong_answer": "I'd shard counters per edge with a periodic merge...",
  "sample_weak_answer": "Use a token bucket in Redis, done.",
  "status": "success"
}
```

---

### `POST /practice/interview/answer/review`

Runs the AnswerReviewer: scores the candidate's answer and recommends the next session move.

**Request body** (`AnswerReviewRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | `string` | ✅ | The question that was asked |
| `candidate_answer` | `string` | ✅ | The candidate's complete answer |
| `position_level` | `string` | ❌ | Seniority level for calibration (default `mid-level`) |
| `question_type` | `string` | ❌ | Category (default `technical`) |
| `difficulty` | `string` | ❌ | Expected difficulty (default `medium`) |
| `expected_keywords` | `array[string]` | ❌ | From `/question/generate` (default `[]`) |
| `evaluation_criteria` | `string` | ❌ | From `/question/generate` (default `""`) |
| `red_flags` | `array[string]` | ❌ | From `/question/generate` (default `[]`) |
| `sample_strong_answer` | `string` | ❌ | From `/question/generate` (default `""`) |
| `sample_weak_answer` | `string` | ❌ | From `/question/generate` (default `""`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/interview/answer/review \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "question": "Design a rate limiter for 50k RPS across 200 edges...",
    "candidate_answer": "I would shard counters per edge and merge every second...",
    "position_level": "senior",
    "question_type": "system_design",
    "difficulty": "hard",
    "expected_keywords": ["sliding window", "sharded counters"],
    "evaluation_criteria": "Quantified throughput and named failure modes.",
    "red_flags": ["no mention of hot keys"]
  }'
```

**Response** (`AnswerReviewResponse`) — store as a history entry and feed to `/progress/track`:

```json
{
  "overall_score": 7.5,
  "technical_accuracy": 8.0,
  "completeness": 6.5,
  "clarity_score": 8.0,
  "depth_score": 7.0,
  "strengths": ["Clear sharding strategy", "Reasoned about merge cost"],
  "weaknesses": ["No capacity numbers"],
  "missed_keywords": ["hot keys"],
  "red_flags_detected": [],
  "improved_answer": "Start with expected QPS per edge, shard, then merge with CRDT-style counters...",
  "weak_topics_identified": ["hot key mitigation"],
  "recommendation": "follow_up",
  "follow_up_suggestion": "Probe how they would detect and spread hot keys.",
  "status": "success"
}
```

`recommendation` is one of `move_on`, `follow_up`, `switch_topic` (a hint for `/session/decide`).

---

### `POST /practice/interview/progress/track`

Runs the ProgressTracker: merges the latest review into the candidate's performance profile.

**Request body** (`ProgressTrackRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current_profile` | `object` | ❌ | Current `progress_state` (default `{}`) |
| `latest_review` | `object` | ❌ | Result from `/answer/review` (default `{}`) |
| `question_topic` | `string` | ❌ | Topic of the last question (default `""`) |
| `question_type` | `string` | ❌ | Type of the last question (default `technical`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/practice/interview/progress/track \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "current_profile": {"overall_score": 6.5, "questions_answered": 2, "weak_areas": ["sharding"]},
    "latest_review": {"overall_score": 7.5, "weak_topics_identified": ["hot key mitigation"]},
    "question_topic": "distributed rate limiting",
    "question_type": "system_design"
  }'
```

**Response** (`ProgressTrackResponse`) — persist `updated_profile` as the next `progress_state`:

```json
{
  "updated_profile": {
    "overall_score": 7.0,
    "questions_answered": 3,
    "weak_areas": ["hot key mitigation"],
    "strong_areas": ["clear communication"],
    "topics_covered": ["incidents", "distributed rate limiting"],
    "topic_scores": {"distributed rate limiting": 7.5},
    "type_scores": {"system_design": 7.5},
    "recommended_next_topics": ["backpressure"],
    "confidence_level": "growing"
  },
  "performance_trend": "improving",
  "status": "success"
}
```

`performance_trend` is one of `improving`, `stable`, `declining`.

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
  "detail": "Failed to generate the interview question."
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
| `LLM_TEMPERATURE` | `0.7` | Default sampling temperature (interview uses `0.4`) |
| `MODEL_NATIVE_COT` | `false` | Skip the DSPy ChainOfThought wrapper for reasoning models |
| `API_TRACE_ENABLED` | `false` | Log request/response bodies from the master middleware |
| `API_KEY` | *(empty)* | Enables `X-API-Key` authentication when set |

---

## Shared model

### `InterviewSession`

Persistence contract for an interview session, managed by the frontend/session app. Every field is round-tripped from the API responses.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique session identifier |
| `candidate_profile` / `position_details` / `interview_context` | `object` | Static session setup |
| `session_history` | `array[object]` | All Q&A with scores and reviews |
| `progress_state` | `object` | Output of the latest `/progress/track` |
| `questions_asked` / `max_questions` | `integer` | Question budget |
| `started_at` / `duration_minutes` / `time_remaining_minutes` | `datetime`/`integer` | Timer state |
| `current_question` | `object` | Active question + calibration data from `/question/generate` |
| `latest_review` | `object` | Most recent `/answer/review` result |
| `is_active` / `termination_reason` | `bool`/`string` | Completion state |
