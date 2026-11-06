# Code Writer API

Base path: `/swe/code-writer`
Tag: `Code Writer`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/swe/code-writer/problems/generate` | Generate a coding problem |
| POST | `/swe/code-writer/test-cases/generate` | Generate visible and hidden test cases |
| POST | `/swe/code-writer/evaluate` | Judge a submission against its test results |
| POST | `/swe/code-writer/quality/analyze` | Review code style, readability, and maintainability |
| POST | `/swe/code-writer/hints/generate` | Give a progressive hint without revealing the solution |
| POST | `/swe/code-writer/solutions/explain` | Explain the optimal solution and compare it with the user's |

All endpoints accept and return `application/json`.

---

### `POST /swe/code-writer/problems/generate`

Generates a complete coding problem for a topic and difficulty.

**Request body** (`ProblemGenerationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | The coding topic, e.g. `Binary Search` |
| `difficulty` | `"easy" \| "medium" \| "hard"` | ✅ | Difficulty level |
| `language` | `string` | ✅ | Language for starter code, e.g. `python` |
| `constraints` | `string` | ❌ | Extra constraints, e.g. `must use recursion` |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/code-writer/problems/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Two Pointers",
    "difficulty": "medium",
    "language": "python",
    "constraints": "Must solve in O(n) time and O(1) space."
  }'
```

**Response** (`ProblemGenerationResponse`):

```json
{
  "problem_title": "Pair With Target Sum",
  "description": "Given a sorted array and a target, return the indices of two numbers that add up to the target.",
  "examples": [
    {"input": "[1, 2, 4, 6], target=6", "output": "[1, 2]", "explanation": "2 + 4 = 6"}
  ],
  "constraints_list": ["2 <= len(nums) <= 10^5", "The array is sorted in ascending order"],
  "starter_code": "def pair_with_target_sum(nums, target):\n    pass",
  "expected_time_complexity": "O(n)",
  "expected_space_complexity": "O(1)"
}
```

---

### `POST /swe/code-writer/test-cases/generate`

Generates test cases for a problem, marking each as visible or hidden.

**Request body** (`TestCaseGenerationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_statement` | `string` | ✅ | Full problem statement including constraints |
| `difficulty` | `"easy" \| "medium" \| "hard"` | ✅ | Harder problems get more edge cases |
| `language` | `string` | ✅ | Language used to format inputs and outputs |
| `num_visible_cases` | `integer` (≥ 0) | ✅ | Visible cases shown to the user (typically 2–3) |
| `num_hidden_cases` | `integer` (≥ 0) | ✅ | Hidden cases used for final evaluation (typically 5–10) |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/code-writer/test-cases/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "problem_statement": "Find the maximum sum subarray of size k.",
    "difficulty": "medium",
    "language": "python",
    "num_visible_cases": 2,
    "num_hidden_cases": 6
  }'
```

**Response** (`TestCaseGenerationResponse`):

```json
{
  "test_cases": [
    {
      "id": "tc_1",
      "input": {"nums": [2, 1, 5, 1, 3, 2], "k": 3},
      "expected_output": 9,
      "is_hidden": false,
      "is_edge_case": false,
      "category": "normal",
      "description": "Basic case with a window in the middle"
    }
  ]
}
```

---

### `POST /swe/code-writer/evaluate`

Judges a submission from the results of its sandbox run. Correctness is based only on the supplied test results.

**Request body** (`CodeEvaluationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_statement` | `string` | ✅ | The full problem statement |
| `user_code` | `string` | ✅ | The submitted code |
| `language` | `string` | ✅ | Language of the submission |
| `test_results` | `array[TestResult]` | ✅ | Results from the code sandbox |

**`TestResult` fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `test_id` | `string` | ✅ | Test case identifier |
| `passed` | `bool` | ✅ | Whether the test passed |
| `input` | `any` | ❌ | The test input |
| `expected_output` | `any` | ❌ | The expected result |
| `actual_output` | `any` | ❌ | What the submitted code produced |
| `error` | `string` | ❌ | Error message if the run failed |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/code-writer/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "problem_statement": "Return the sum of a list.",
    "user_code": "def solve(arr):\n    return sum(arr)",
    "language": "python",
    "test_results": [
      {"test_id": "tc_1", "passed": true, "input": [1, 2, 3], "expected_output": 6, "actual_output": 6, "error": null},
      {"test_id": "tc_2", "passed": false, "input": [], "expected_output": 0, "actual_output": null, "error": "TypeError"}
    ]
  }'
```

**Response** (`CodeEvaluationResponse`):

```json
{
  "is_correct": false,
  "score": 50.0,
  "total_tests": 2,
  "passed_tests": 1,
  "failed_tests": 1,
  "failed_cases_summary": [
    {
      "test_id": "tc_2",
      "input": "[]",
      "expected": "0",
      "actual": "None",
      "reason_for_failure": "The function raised a TypeError on an empty list."
    }
  ],
  "feedback": "Your solution works for non-empty lists. Check how it behaves on an empty input.",
  "verdict": "Partial"
}
```

`verdict` is one of `Accepted`, `Wrong Answer`, `Runtime Error`, or `Partial`.

---

### `POST /swe/code-writer/quality/analyze`

Reviews code style, readability, and maintainability. Independent of correctness.

**Request body** (`CodeQualityRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_code` | `string` | ✅ | The code to review |
| `language` | `string` | ✅ | Programming language |
| `rubric` | `string` | ❌ | Custom rubric or checklist to evaluate against |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/code-writer/quality/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "user_code": "def f(x):\n  return x*2 if x>0 else 0",
    "language": "python"
  }'
```

**Response** (`CodeQualityResponse`):

```json
{
  "overall_rating": "Average",
  "style_score": 5.0,
  "readability_score": 6.0,
  "maintainability_score": 6.5,
  "issues": [
    {
      "line": "1",
      "severity": "warning",
      "category": "naming",
      "description": "Function name 'f' does not describe what it does."
    }
  ],
  "suggestions": ["Rename 'f' to something descriptive, such as 'double_if_positive'."],
  "strengths": ["The logic is short and easy to follow."],
  "complexity_rating": "Simple"
}
```

`style_score`, `readability_score`, and `maintainability_score` range from 0.0 to 10.0. `issues[].severity` is one of `critical`, `warning`, or `suggestion`.

---

### `POST /swe/code-writer/hints/generate`

Gives a hint for a stuck user, at the requested level of specificity. It never reveals the full solution.

**Request body** (`HintRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_statement` | `string` | ✅ | The problem the user is solving |
| `user_code` | `string` | ❌ | The user's current attempt, if any |
| `hint_level` | `1 \| 2 \| 3` | ✅ | `1` = conceptual nudge, `2` = directional hint, `3` = strong hint |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/code-writer/hints/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "problem_statement": "Find the longest substring without repeating characters.",
    "user_code": "def lengthOfLongestSubstring(s):\n    # I am stuck here",
    "hint_level": 1
  }'
```

**Response** (`HintResponse`):

```json
{
  "hint_text": "Think about how you could track the characters you have already seen in the current window.",
  "hint_type": "conceptual",
  "guiding_question": "What happens to your window when you see a character that is already in it?",
  "next_level_teaser": "A stronger hint will point you to a specific technique for moving the window boundaries."
}
```

`hint_type` is one of `conceptual`, `algorithmic`, `structural`, or `edge_case`.

---

### `POST /swe/code-writer/solutions/explain`

Explains the optimal solution step by step and compares it with the user's approach. Intended for use after submission.

**Request body** (`SolutionExplanationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_statement` | `string` | ✅ | The original problem statement |
| `user_code` | `string` | ✅ | The code the user submitted |
| `optimal_solution` | `string` | ✅ | The reference solution code |
| `language` | `string` | ✅ | Programming language |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/code-writer/solutions/explain \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "problem_statement": "Return the sum of a list.",
    "user_code": "def solve(arr):\n    total = 0\n    for x in arr:\n        total += x\n    return total",
    "optimal_solution": "def solve(arr):\n    return sum(arr)",
    "language": "python"
  }'
```

**Response** (`SolutionExplanationResponse`):

```json
{
  "explanation": "The built-in sum() adds every element in one pass, so the work grows linearly with the list length.",
  "user_approach_summary": "The user loops through the list and keeps a running total.",
  "comparison": "Both approaches are O(n) in time and O(1) in space. The optimal one is shorter and relies on a built-in.",
  "time_complexity": "O(n), one pass over the list",
  "space_complexity": "O(1), only a single accumulator",
  "user_time_complexity": "O(n), one explicit loop",
  "user_space_complexity": "O(1), a single accumulator",
  "key_concepts": ["Iteration", "Accumulation"],
  "common_mistakes": ["Forgetting to initialise the accumulator"],
  "learning_resources": ["Python built-in functions", "Accumulator patterns"]
}
```

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing or invalid `X-API-Key` header, when `API_KEY` is set |
| `422` | FastAPI validation error list | Missing or invalid request field, such as an unknown `difficulty` or `hint_level` of `4` |
| `500` | `Failed to generate the code writer result.` | The AI pipeline failed or returned output that does not match the schema |

**Example 500:**

```json
{
  "detail": "Failed to generate the code writer result."
}
```

## Authentication

Optional `X-API-Key` header, applied to every endpoint in this module. When `API_KEY` is set in the environment, requests without a matching key are rejected with `401`. When blank, the guard is disabled.

## Environment variables

This module has no storage settings of its own. It uses the shared LLM configuration.

| Variable | Default | Purpose |
|----------|---------|---------|
| `LLM_MODEL_NAME` | `gpt-4o-mini` | Model passed to DSPy |
| `LLM_API_KEY` | *(empty)* | Provider API key |
| `LLM_API_BASE` | `https://api.openai.com/v1` | OpenAI-compatible base URL |
| `LLM_TEMPERATURE` | `0.7` | Sampling temperature (this module overrides it to `0.2`) |
| `MODEL_NATIVE_COT` | `false` | When `true`, skips the DSPy ChainOfThought wrapper |
| `API_KEY` | *(empty)* | Enables the `X-API-Key` guard when set |
| `DEBUG` | `false` | FastAPI debug mode |
| `LOG_LEVEL` | `INFO` (`DEBUG` if `DEBUG=true`) | Logging verbosity |
| `HOST` / `PORT` | `0.0.0.0` / `8000` | Uvicorn bind address |
