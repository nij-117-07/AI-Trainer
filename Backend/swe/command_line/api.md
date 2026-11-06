# Command Line API

Base path: `/swe/command-line`
Tag: `Command Line`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/swe/command-line/challenges/generate` | Generate a CLI challenge with a simulated file system |
| POST | `/swe/command-line/commands/evaluate` | Judge a user's command against a challenge |
| POST | `/swe/command-line/hints/generate` | Give a progressive hint without revealing the full command |
| POST | `/swe/command-line/pipelines/design` | Break down a multi-command pipeline and suggest improvements |
| POST | `/swe/command-line/scripts/evaluate` | Review a shell script for correctness, robustness, and security |
| POST | `/swe/command-line/commands/explain` | Explain each component of a command or pipeline |
| POST | `/swe/command-line/errors/diagnose` | Diagnose a command error and suggest a fix |
| POST | `/swe/command-line/commands/optimize` | Suggest more efficient or idiomatic alternatives |

All endpoints accept and return `application/json`.

---

### `POST /swe/command-line/challenges/generate`

Generates a CLI challenge, including the simulated starting file system and the reference solution.

**Request body** (`ChallengeGenerationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | Topic area, e.g. `text processing`, `permissions`, `pipelines` |
| `difficulty` | `"beginner" \| "intermediate" \| "advanced" \| "expert"` | ✅ | Difficulty level |
| `environment` | `"linux" \| "macos" \| "windows_powershell" \| "windows_cmd"` | ✅ | Target OS and shell |
| `scenario_context` | `string` | ❌ | Real-world framing, e.g. `You're analyzing web server logs` |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/command-line/challenges/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "text processing",
    "difficulty": "intermediate",
    "environment": "linux",
    "scenario_context": "You are analyzing web server logs to find suspicious activity."
  }'
```

**Response** (`ChallengeGenerationResponse`), abbreviated:

```json
{
  "challenge_title": "Count Unique Visitors",
  "scenario": "The access log is growing fast and you need a quick visitor count.",
  "task_description": "Count the number of unique IP addresses in access.log.",
  "initial_filesystem": {
    "current_directory": "/var/www",
    "tree": {"access.log": "file"},
    "file_contents": {},
    "permissions": {"access.log": "-rw-r--r--"}
  },
  "expected_command": "awk '{print $1}' access.log | sort -u | wc -l",
  "acceptable_alternatives": ["cut -d' ' -f1 access.log | sort -u | wc -l"],
  "expected_output": "42",
  "evaluation_criteria": ["Uses standard tools", "Handles duplicates"],
  "key_commands_tested": ["awk", "sort", "uniq", "wc"],
  "learning_objective": "Combining small tools in a pipeline to answer a counting question."
}
```

---

### `POST /swe/command-line/commands/evaluate`

Judges the user's command against the challenge. Correctness is based on the criteria and the optional simulated output.

**Request body** (`CommandEvaluationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `challenge` | `ChallengeDetails` | ✅ | The challenge being answered (see below) |
| `user_command` | `string` | ✅ | The command or pipeline submitted |
| `simulated_output` | `string` | ❌ | Output the command would produce, if the sandbox provides it |
| `environment` | `string` | ✅ | Shell environment, e.g. `linux`, `powershell` |

**`ChallengeDetails` fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `task_description` | `string` | ✅ | What needs to be done |
| `initial_filesystem` | `object` | ❌ | Starting environment (default `{}`) |
| `expected_output` | `string` | ❌ | What correct output looks like |
| `evaluation_criteria` | `array[string]` | ❌ | Criteria to check |
| `expected_command` | `string` | ❌ | Reference solution |
| `acceptable_alternatives` | `array[string]` | ❌ | Other valid solutions |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/command-line/commands/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "challenge": {
      "task_description": "Find all .log files larger than 10MB",
      "expected_command": "find . -name '\''*.log'\'' -size +10M",
      "evaluation_criteria": ["Uses find", "Filters by size", "Filters by extension"]
    },
    "user_command": "find /var/log -type f -name '\''*.log'\'' -size +10M",
    "simulated_output": "/var/log/app.log",
    "environment": "linux"
  }'
```

**Response** (`CommandEvaluationResponse`), abbreviated:

```json
{
  "is_correct": true,
  "score": 95.0,
  "verdict": "Perfect",
  "output_matches": true,
  "criteria_met": [
    {"criterion": "Uses find", "met": true, "explanation": "The command calls find."}
  ],
  "command_breakdown": [
    {"component": "find /var/log -type f", "purpose": "Searches regular files under /var/log", "correctness": "correct"}
  ],
  "efficiency_rating": "optimal",
  "feedback": "Clean and correct. Scoping with -type f avoids matching directories.",
  "warnings": []
}
```

`verdict` is one of `Perfect`, `Correct`, `Partially Correct`, `Incorrect`, or `Dangerous`.

---

### `POST /swe/command-line/hints/generate`

Gives a hint at the requested level for a user who is stuck. Level 3 gives the command structure with blanks, not the full answer.

**Request body** (`CommandHintRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `challenge` | `ChallengeDetails` | ✅ | The challenge (same shape as above) |
| `user_attempt` | `string` | ❌ | The user's current attempt |
| `user_error` | `string` | ❌ | Error message the user is seeing |
| `hint_level` | `1 \| 2 \| 3` | ✅ | `1` = tool category, `2` = specific command and flags, `3` = command structure with blanks |
| `hints_already_given` | `array[string]` | ❌ | Earlier hints, to avoid repetition |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/command-line/hints/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "challenge": {
      "task_description": "Count the number of unique IP addresses in access.log",
      "expected_command": "awk '\''{print $1}'\'' access.log | sort -u | wc -l"
    },
    "user_attempt": "grep access.log",
    "user_error": "grep: access.log: No such file or directory",
    "hint_level": 1
  }'
```

**Response** (`CommandHintResponse`), abbreviated:

```json
{
  "hint_text": "Think about a tool that extracts one column from text, then one that removes duplicates.",
  "command_category": "text processing",
  "suggested_commands": ["awk", "cut", "sort"],
  "key_flags": [
    {"flag": "-u", "purpose": "Keep only unique lines", "why_relevant": "Duplicate IPs must be removed"}
  ],
  "common_mistakes": ["Counting lines before removing duplicates"],
  "man_page_tip": "sort -u outputs each distinct line once.",
  "guiding_question": "Which step should happen before the count, and why?"
}
```

---

### `POST /swe/command-line/pipelines/design`

Breaks a pipeline into stages, checks that data flows correctly between them, and suggests a better version.

**Request body** (`PipelineDesignRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_pipeline` | `string` | ✅ | The full pipeline, which may include `\|`, `>`, `&&`, `$()` |
| `task_goal` | `string` | ✅ | What the pipeline should accomplish |
| `environment` | `string` | ✅ | Shell, e.g. `bash`, `zsh` |
| `input_data_sample` | `string` | ❌ | Sample input the pipeline would process |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/command-line/pipelines/design \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "user_pipeline": "cat access.log | grep '\''ERROR'\'' | awk '\''{print $4}'\'' | sort | uniq -c | sort -rn | head -5",
    "task_goal": "Find the top 5 IP addresses that caused errors",
    "environment": "bash",
    "input_data_sample": "2024-01-15 10:30:45 ERROR 192.168.1.1 timeout"
  }'
```

**Response** (`PipelineDesignResponse`), abbreviated:

```json
{
  "pipeline_stages": [
    {
      "stage_number": 1,
      "command": "cat access.log",
      "input_source": "file",
      "output_format": "raw log lines",
      "purpose": "Read the log",
      "correctness": "questionable"
    }
  ],
  "data_flow_diagram": "access.log -> cat -> grep -> awk -> sort -> uniq -c -> sort -rn -> head",
  "is_correct": true,
  "issues": [
    {"stage": "1", "issue_type": "performance", "description": "cat adds an unnecessary process.", "fix": "Pass the file to grep directly."}
  ],
  "improved_pipeline": "grep 'ERROR' access.log | awk '{print $4}' | sort | uniq -c | sort -rn | head -5",
  "one_liner_alternative": null,
  "scripting_recommendation": null,
  "portability_notes": ["Works on GNU and BSD userlands."],
  "key_concepts": ["piping", "useless use of cat"]
}
```

`issue_type` is one of `logic`, `syntax`, `quoting`, `portability`, or `performance`.

---

### `POST /swe/command-line/scripts/evaluate`

Reviews a shell script and scores it from 0 to 100 on correctness, robustness, security, and readability.

**Request body** (`ShellScriptEvaluationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_script` | `string` | ✅ | The script source |
| `task_requirement` | `string` | ✅ | What the script should accomplish |
| `environment` | `string` | ✅ | Target shell, e.g. `bash`, `sh` |
| `test_inputs` | `array[object]` | ❌ | Test inputs with expected outputs, as `{"<key>": "<value>"}` pairs |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/command-line/scripts/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "user_script": "#!/bin/bash\nfor file in $1/*; do\n  size=$(stat -c %s $file)\n  if [ $size -gt 1000000 ]; then\n    rm $file\n  fi\ndone",
    "task_requirement": "Delete files larger than 1MB in a given directory",
    "environment": "bash"
  }'
```

**Response** (`ShellScriptEvaluationResponse`), abbreviated:

```json
{
  "is_functional": true,
  "overall_score": 38.0,
  "correctness_score": 60.0,
  "robustness_score": 20.0,
  "security_score": 25.0,
  "readability_score": 55.0,
  "issues": [
    {
      "line": "3-5",
      "severity": "critical",
      "category": "quoting",
      "description": "Unquoted variables break on paths with spaces.",
      "fix": "Quote every expansion, e.g. \"$file\"."
    }
  ],
  "checklist": {"has_shebang": true, "uses_set_euo": false, "quotes_variables": false},
  "improved_script": "#!/bin/bash\nset -euo pipefail\n...",
  "key_improvements": ["Quote all variables", "Validate the directory argument"],
  "security_warnings": ["Deleting files without confirmation can cause data loss."]
}
```

`issues[].severity` is one of `critical`, `warning`, or `suggestion`.

---

### `POST /swe/command-line/commands/explain`

Explains a command or pipeline at the requested depth.

**Request body** (`CommandExplanationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | `string` | ✅ | The command or pipeline to explain |
| `environment` | `string` | ✅ | Shell, e.g. `bash`, `powershell` |
| `explanation_depth` | `"beginner" \| "intermediate" \| "advanced"` | ✅ | Depth of the explanation |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/command-line/commands/explain \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "command": "find /var/log -type f -name '\''*.log'\'' -mtime +7 -exec gzip {} \\;",
    "environment": "bash",
    "explanation_depth": "intermediate"
  }'
```

**Response** (`CommandExplanationResponse`), abbreviated:

```json
{
  "plain_english_summary": "Finds log files older than seven days under /var/log and compresses each one.",
  "component_breakdown": [
    {"component": "find", "type": "command", "explanation": "Walks the directory tree.", "man_reference": "find(1)"},
    {"component": "-mtime +7", "type": "flag", "explanation": "Matches files modified more than 7 days ago.", "man_reference": null}
  ],
  "data_flow": "find emits each matching path, and gzip runs once per path.",
  "expected_output_description": "No output on success. Each matched file is replaced by a .gz file.",
  "side_effects": ["Original .log files are removed and replaced by .gz files."],
  "potential_dangers": ["Running as root touches system logs."],
  "related_commands": [
    {"command": "logrotate", "relationship": "alternative", "when_to_use": "For scheduled rotation without custom scripts."}
  ],
  "common_variations": ["Use -exec gzip {} + to batch files and run fewer processes."],
  "visual_diagram": null
}
```

`component_breakdown[].type` is one of `command`, `flag`, `argument`, `operator`, `redirect`, or `variable`.

---

### `POST /swe/command-line/errors/diagnose`

Finds the root cause of a command error and suggests a corrected command.

**Request body** (`ErrorDiagnosisRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_command` | `string` | ✅ | The command the user ran |
| `error_output` | `string` | ✅ | The full error or stderr output |
| `environment` | `string` | ✅ | Shell and OS |
| `user_intent` | `string` | ❌ | What the user was trying to do |
| `surrounding_context` | `string` | ❌ | Current directory, file state, and similar context |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/command-line/errors/diagnose \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "user_command": "cat /var/log/app.log | grep ERROR | awk '\''{print $3}",
    "error_output": "bash: unexpected EOF while looking for matching `'\''\nbash: syntax error: unexpected end of file",
    "environment": "bash",
    "user_intent": "Extract the third field from ERROR lines in the log"
  }'
```

**Response** (`ErrorDiagnosisResponse`), abbreviated:

```json
{
  "diagnosis": "The awk program is missing its closing single quote, so the shell waits for more input.",
  "root_cause": "quoting_issue",
  "confidence": "certain",
  "corrected_command": "cat /var/log/app.log | grep ERROR | awk '{print $3}'",
  "alternative_fixes": ["grep ERROR /var/log/app.log | awk '{print $3}'"],
  "explanation_for_learning": "Every opening quote needs a matching closing quote before the shell runs the command.",
  "prevention_tips": ["Check quotes in multi-line commands before pressing Enter."],
  "related_errors": [
    {"error_pattern": "unexpected EOF while looking for matching", "cause": "Unclosed quote", "fix": "Add the missing quote."}
  ],
  "severity": "trivial"
}
```

`root_cause` is one of `syntax_error`, `permission_denied`, `file_not_found`, `command_not_found`, `quoting_issue`, `path_issue`, `environment_issue`, `argument_error`, `network_error`, `resource_limit`, `logic_error`, or `other`. `severity` is one of `trivial`, `minor`, `moderate`, or `serious`.

---

### `POST /swe/command-line/commands/optimize`

Suggests faster, cleaner, or more idiomatic versions of a command that already works.

**Request body** (`CommandOptimizationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_command` | `string` | ✅ | The working command or pipeline |
| `task_goal` | `string` | ✅ | What the command accomplishes |
| `environment` | `string` | ✅ | Shell environment |
| `optimization_priority` | `"speed" \| "readability" \| "portability" \| "resource_usage" \| "elegance"` | ❌ | What to optimize for |
| `data_scale` | `string` | ❌ | Size of the data, e.g. `50GB log file` |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/command-line/commands/optimize \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "user_command": "cat access.log | grep '\''200'\'' | awk '\''{print $1}'\'' | sort | uniq -c | sort -rn | head -10",
    "task_goal": "Find the top 10 IPs with 200 status codes",
    "environment": "bash",
    "optimization_priority": "speed",
    "data_scale": "50GB log file"
  }'
```

**Response** (`CommandOptimizationResponse`), abbreviated:

```json
{
  "optimized_command": "awk '$9 == 200 {print $1}' access.log | sort | uniq -c | sort -rn | head -10",
  "alternatives": [
    {
      "command": "awk '$9 == 200 {c[$1]++} END {for (ip in c) print c[ip], ip}' access.log | sort -rn | head -10",
      "approach": "awk-only",
      "pros": ["One process for the whole job"],
      "cons": ["Keeps every IP in memory"],
      "best_for": "Large logs with a moderate number of distinct IPs",
      "speed_rating": "fastest"
    }
  ],
  "performance_comparison": {
    "original_time_estimate": "several minutes",
    "optimized_time_estimate": "about a minute",
    "speedup_factor": "3x",
    "memory_comparison": "Similar, because sort buffers to disk"
  },
  "what_changed": [
    {"change": "Removed cat", "why_better": "grep and awk can read the file directly.", "impact": "medium"}
  ],
  "anti_patterns_identified": ["Useless Use of Cat"],
  "pro_tips": ["Filter with awk before piping to sort to reduce the data sorted."],
  "tool_recommendation": null
}
```

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing or invalid `X-API-Key` header, when `API_KEY` is set |
| `422` | FastAPI validation error list | Missing or invalid field, such as an unknown `difficulty` or `hint_level` of `4` |
| `500` | `Failed to generate the command line result.` | The AI pipeline failed or returned output that does not match the schema |

**Example 500:**

```json
{
  "detail": "Failed to generate the command line result."
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
