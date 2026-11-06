# System Design API

Base path: `/swe/system-design`
Tag: `System Design`

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/swe/system-design/problems/generate` | Generate a system design problem with requirements and traffic estimates |
| POST | `/swe/system-design/requirements/clarify` | Evaluate the questions and assumptions from the clarification phase |
| POST | `/swe/system-design/architecture/evaluate` | Evaluate a proposed high-level architecture against the requirements |
| POST | `/swe/system-design/components/evaluate` | Evaluate one technology choice for a component |
| POST | `/swe/system-design/tradeoffs/analyze` | Analyse the gains and costs of each design decision |
| POST | `/swe/system-design/scalability/assess` | Assess behaviour under growth and identify breaking points |
| POST | `/swe/system-design/bottlenecks/detect` | Find performance bottlenecks along the key data flows |
| POST | `/swe/system-design/designs/score` | Produce the final multi-dimension score for a complete design |

All endpoints accept and return `application/json`.

---

### `POST /swe/system-design/problems/generate`

Generates a design problem with functional and non-functional requirements, constraints, and traffic estimates.

**Request body** (`SystemDesignPromptRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `topic` | `string` | ✅ | System to design, e.g. `URL Shortener`, `Rate Limiter` |
| `difficulty` | `"junior" \| "mid" \| "senior" \| "staff"` | ✅ | Seniority level the problem targets |
| `scale_requirement` | `string` | ❌ | Expected scale, e.g. `100M DAU`. Inferred when omitted |
| `focus_areas` | `array[string]` | ❌ | Areas to emphasise, e.g. `["consistency", "low_latency"]` |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/system-design/problems/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "topic": "Design a Rate Limiter",
    "difficulty": "senior",
    "focus_areas": ["consistency", "low_latency", "distributed_systems"]
  }'
```

**Response** (`SystemDesignPromptResponse`), abbreviated:

```json
{
  "problem_title": "Distributed Rate Limiter",
  "problem_statement": "Design a service that limits API requests per user across a fleet of gateways.",
  "functional_requirements": ["Limit requests per user and per API key", "Return 429 when the limit is exceeded"],
  "non_functional_requirements": ["Under 5 ms added latency at p99", "99.99% availability"],
  "extended_requirements": ["Per-region quotas"],
  "constraints": ["Counters must be shared across all gateways"],
  "estimated_traffic": {
    "daily_active_users": "50M",
    "requests_per_second_read": "100K",
    "requests_per_second_write": "100K",
    "storage_per_day": "5GB"
  },
  "evaluation_criteria": ["Choice of algorithm", "Handling of race conditions"],
  "suggested_time_allocation": {
    "requirements_clarification": "5",
    "high_level_design": "15",
    "deep_dive": "15",
    "scaling_discussion": "10"
  }
}
```

---

### `POST /swe/system-design/requirements/clarify`

Scores the quality of the clarifying questions and assumptions the candidate gave before designing.

**Request body** (`RequirementsClarificationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_statement` | `string` | ✅ | The problem given to the candidate |
| `user_questions` | `array[string]` | ✅ | Clarifying questions the candidate asked |
| `user_priorities` | `array[string]` | ❌ | Features the candidate prioritised |
| `user_assumptions` | `array[string]` | ❌ | Assumptions the candidate stated |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/system-design/requirements/clarify \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "problem_statement": "Design a URL shortener like bit.ly.",
    "user_questions": ["What is the expected traffic?", "Do we need analytics?"],
    "user_priorities": ["short URL generation", "redirect speed"],
    "user_assumptions": ["Assuming a read-heavy workload"]
  }'
```

**Response** (`RequirementsClarificationResponse`), abbreviated:

```json
{
  "clarification_score": 72.0,
  "questions_asked_analysis": [
    {
      "question": "What is the expected traffic?",
      "category": "scale",
      "quality": "excellent",
      "reasoning": "Traffic drives every later sizing decision."
    }
  ],
  "missed_questions": [
    {"question": "How long do short links live?", "importance": "important", "why_it_matters": "Determines storage growth."}
  ],
  "assumptions_analysis": [
    {"assumption": "Assuming a read-heavy workload", "validity": "reasonable", "feedback": "Typical for URL shorteners."}
  ],
  "priority_assessment": "Good focus on redirect speed.",
  "overall_feedback": "Good scale questions. Ask about link expiry and abuse before designing.",
  "red_flags": [],
  "strengths": ["Asked about scale early"]
}
```

`category` is one of `functional`, `non_functional`, `scale`, `edge_case`, `constraint`, or `priority`. `quality` is one of `excellent`, `good`, `neutral`, `redundant`, or `misguided`.

---

### `POST /swe/system-design/architecture/evaluate`

Evaluates the proposed components, data flow, and requirement coverage.

**Request body** (`ArchitectureEvaluationRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_statement` | `string` | ✅ | The design problem |
| `requirements` | `Requirements` | ✅ | `functional`, `non_functional`, and `constraints` lists |
| `user_architecture_description` | `string` | ✅ | Text description of the architecture |
| `user_components` | `array[ArchitectureComponent]` | ❌ | Components the candidate proposed |
| `user_data_flow` | `string` | ✅ | How data flows through the system |

**`ArchitectureComponent` fields**: `name` (required), `purpose`, `technology`.

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/system-design/architecture/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "problem_statement": "Design a URL shortener.",
    "requirements": {
      "functional": ["Shorten URL", "Redirect"],
      "non_functional": ["100M URLs per month", "<100 ms redirect"],
      "constraints": ["No external dependencies for the core flow"]
    },
    "user_architecture_description": "Load balancer to API servers. API servers check Redis, then fall back to PostgreSQL.",
    "user_components": [
      {"name": "Load Balancer", "purpose": "Distribute traffic", "technology": "NGINX"},
      {"name": "Cache", "purpose": "Fast lookups", "technology": "Redis"}
    ],
    "user_data_flow": "Read: LB, API, Redis, then DB on a miss. Write: LB, API, DB."
  }'
```

**Response** (`ArchitectureEvaluationResponse`), abbreviated:

```json
{
  "architecture_score": 68.0,
  "completeness_score": 60.0,
  "correctness_score": 75.0,
  "clarity_score": 70.0,
  "components_evaluation": [
    {"component_name": "Cache", "necessity": "essential", "appropriateness": "excellent", "feedback": "Redis suits key-value lookups."}
  ],
  "missing_components": [
    {"component": "ID generator", "why_needed": "Writes need unique short codes.", "importance": "critical"}
  ],
  "data_flow_analysis": {
    "is_complete": false,
    "bottlenecks": ["Single database for all writes"],
    "single_points_of_failure": ["Primary database"],
    "flow_clarity": "somewhat_clear"
  },
  "requirements_coverage": {"Shorten URL": false, "Redirect": true},
  "strengths": ["Cache placed in front of the database"],
  "weaknesses": ["No code generation strategy"],
  "overall_feedback": "A sound base, but the write path and failure handling need work."
}
```

---

### `POST /swe/system-design/components/evaluate`

Judges one technology choice against the component's purpose and the scale requirements.

**Request body** (`ComponentChoiceRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `component_name` | `string` | ✅ | Component name, e.g. `Cache` |
| `component_purpose` | `string` | ✅ | What the component must do |
| `user_choice` | `string` | ✅ | The technology chosen |
| `user_justification` | `string` | ✅ | The candidate's reasoning |
| `system_context` | `string` | ✅ | Overall system context |
| `scale_requirements` | `object` | ❌ | `data_volume`, `read_rate`, `write_rate`, `latency_requirement` as strings |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/system-design/components/evaluate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "component_name": "Cache Layer",
    "component_purpose": "Cache frequently accessed URL mappings to reduce DB load",
    "user_choice": "Redis",
    "user_justification": "Redis is fast, in-memory, and supports TTL.",
    "system_context": "URL shortener with 100M URLs and a 100:1 read to write ratio",
    "scale_requirements": {
      "data_volume": "100M URL mappings, about 10GB hot data",
      "read_rate": "100K RPS",
      "latency_requirement": "<50ms p99"
    }
  }'
```

**Response** (`ComponentChoiceResponse`), abbreviated:

```json
{
  "choice_rating": "excellent",
  "score": 88.0,
  "justification_analysis": {
    "is_sound": true,
    "strengths_of_reasoning": ["Matches the read-heavy pattern"],
    "gaps_in_reasoning": ["No memory sizing"],
    "missing_considerations": ["Eviction policy"]
  },
  "pros_of_choice": ["Sub-millisecond reads", "Native TTL support"],
  "cons_of_choice": ["Data must fit in memory", "Failover needs care"],
  "alternatives": [
    {"technology": "Memcached", "why_consider": "Simpler multi-threaded cache", "tradeoff_vs_user_choice": "No persistence or rich data types"}
  ],
  "scale_fit": "perfect_fit",
  "potential_issues": ["Cache stampede on popular links"],
  "interview_feedback": "Good choice. Explain sizing and eviction next.",
  "follow_up_questions": ["How do you handle a hot key?"]
}
```

---

### `POST /swe/system-design/tradeoffs/analyze`

Identifies what each decision gains and gives up, and where the candidate sits on the CAP spectrum.

**Request body** (`TradeoffAnalysisRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `system_context` | `string` | ✅ | The system and its requirements |
| `user_decisions` | `array[TradeoffDecision]` | ✅ | Major design decisions |

**`TradeoffDecision` fields**: `decision` (required), `context`, `category`.

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/system-design/tradeoffs/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "system_context": "Distributed chat application with 50M DAU",
    "user_decisions": [
      {"decision": "Use Cassandra for message storage", "context": "Need high write throughput", "category": "database"},
      {"decision": "Eventual consistency for message delivery", "context": "Availability over consistency", "category": "consistency_model"}
    ]
  }'
```

**Response** (`TradeoffAnalysisResponse`), abbreviated:

```json
{
  "tradeoff_analysis": [
    {
      "decision": "Use Cassandra for message storage",
      "gains": ["Linear write scaling"],
      "costs": ["Limited ad hoc querying"],
      "when_this_is_right": "Write-heavy workloads with known access patterns",
      "when_this_is_wrong": "Workloads needing joins or strong transactions",
      "alternative_with_opposite_tradeoff": "PostgreSQL with sharding"
    }
  ],
  "consistency_vs_availability": {
    "choice": "AP",
    "justification": "Message delivery tolerates brief lag.",
    "implications": "Clients must handle out-of-order messages.",
    "was_appropriate": "yes"
  },
  "latency_vs_consistency": null,
  "cost_vs_performance": null,
  "complexity_vs_maintainability": null,
  "overall_tradeoff_awareness": "good",
  "key_insight": "Eventual consistency is acceptable here only if ordering is handled on the client.",
  "interview_tips": ["Name the cost of each choice before defending it."]
}
```

`overall_tradeoff_awareness` is one of `excellent`, `good`, `basic`, or `lacking`.

---

### `POST /swe/system-design/scalability/assess`

Analyses how the design behaves at higher scale, with bottlenecks, single points of failure, and scaling stages.

**Request body** (`ScalabilityAssessmentRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_statement` | `string` | ✅ | The design problem |
| `user_architecture` | `string` | ✅ | Text description of the architecture |
| `user_components` | `array[ArchitectureComponent]` | ❌ | Components in the design |
| `current_scale` | `object` | ✅ | Current `dau`, `rps`, and `storage` as strings |
| `growth_projections` | `object` | ❌ | Expected growth, e.g. `{"dau_growth": "10x in 3 years"}` |

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/system-design/scalability/assess \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "problem_statement": "Design a Twitter-like social network.",
    "user_architecture": "Load balancer to API servers. PostgreSQL primary with read replicas. Redis for sessions. S3 for media.",
    "user_components": [
      {"name": "PostgreSQL", "purpose": "Primary database"},
      {"name": "Redis", "purpose": "Session cache"}
    ],
    "current_scale": {"dau": "10M", "rps": "50K", "storage": "5TB"},
    "growth_projections": {"dau_growth": "10x in 3 years"}
  }'
```

**Response** (`ScalabilityAssessmentResponse`), abbreviated:

```json
{
  "scalability_score": 61.0,
  "scaling_strategy": "mixed",
  "bottleneck_analysis": [
    {
      "component": "PostgreSQL primary",
      "severity": "major",
      "trigger_load": "Write volume beyond one node",
      "symptom": "Replication lag and write timeouts",
      "solution": "Shard by user ID"
    }
  ],
  "single_points_of_failure": [
    {"component": "PostgreSQL primary", "impact": "No writes until failover", "mitigation": "Automatic failover"}
  ],
  "scaling_stages": [
    {"scale": "10x", "status": "strained", "issues_at_this_scale": ["Primary write load"], "changes_needed": ["Shard the database"]}
  ],
  "database_scalability": {"strategy": "replication", "adequacy": "adequate", "concerns": ["Single write primary"]},
  "cache_scalability": {"strategy": "single node", "concerns": ["No cluster mode"]},
  "api_scalability": {"strategy": "horizontal", "concerns": []},
  "breaking_point": "Writes to the primary database fail first, at roughly 3 to 5 times the current write rate.",
  "scalability_strengths": ["Stateless API tier"],
  "scalability_weaknesses": ["Single write primary"],
  "recommendations": ["Shard the primary database", "Move sessions to a Redis cluster"]
}
```

`scaling_strategy` is one of `horizontal`, `vertical`, `mixed`, `unclear`, or `absent`. `scaling_stages[].status` is one of `works_well`, `strained`, `breaking`, or `failed`.

---

### `POST /swe/system-design/bottlenecks/detect`

Finds where performance degrades under load, with a latency breakdown for the critical flow.

**Request body** (`BottleneckDetectionRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_architecture` | `string` | ✅ | Text description of the architecture |
| `user_data_flows` | `array[DataFlow]` | ✅ | Key flows in the system |
| `scale_requirements` | `object` | ✅ | Scale targets, e.g. `rps`, `p99_latency`, `availability` |

**`DataFlow` fields**: `flow_name`, `description`, `expected_frequency` (all required).

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/system-design/bottlenecks/detect \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "user_architecture": "API gateway to auth service to user service to PostgreSQL. Feed service reads from a Redis cache with a 5-minute TTL.",
    "user_data_flows": [
      {
        "flow_name": "feed_loading",
        "description": "Gateway, auth check, feed service, Redis (miss?), DB, return",
        "expected_frequency": "50K/sec"
      }
    ],
    "scale_requirements": {"rps": "100K", "p99_latency": "200ms", "availability": "99.99%"}
  }'
```

**Response** (`BottleneckDetectionResponse`), abbreviated:

```json
{
  "bottlenecks": [
    {
      "id": "b1",
      "location": "PostgreSQL user table",
      "type": "database",
      "severity": "critical",
      "trigger_condition": "Cache miss rate above 20%",
      "impact": "p99 latency rises above the 200 ms target",
      "estimated_impact": "p99 about 500 ms",
      "root_cause": "Every miss runs an unindexed feed query",
      "solution": "Add a covering index and precompute feeds",
      "solution_complexity": "moderate"
    }
  ],
  "latency_breakdown": [
    {"step": "Auth check", "estimated_latency_ms": "5", "is_optimizable": true, "optimization": "Cache token validation"}
  ],
  "throughput_limiting_factors": ["Database connections per service instance"],
  "hot_paths": [{"path": "feed_loading", "frequency": "50K/sec", "risk": "high"}],
  "resource_contention_points": [{"resource": "DB connection pool", "components": "feed service, user service"}],
  "total_bottlenecks_found": 1,
  "critical_bottlenecks_count": 1,
  "executive_summary": "The feed read path depends on the database on every cache miss, which will break the latency target first."
}
```

`bottlenecks[].type` is one of `compute`, `network`, `database`, `cache`, `io`, `lock_contention`, or `serialization`.

---

### `POST /swe/system-design/designs/score`

Scores a complete design submission across nine dimensions and gives a hire recommendation.

**Request body** (`DesignScoreRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `problem_statement` | `string` | ✅ | The design problem |
| `difficulty_level` | `"junior" \| "mid" \| "senior" \| "staff"` | ✅ | Target seniority |
| `requirements_clarification` | `string` | ❌ | Summary of the clarification phase |
| `high_level_design` | `string` | ✅ | The high-level architecture |
| `component_choices` | `array[ComponentChoice]` | ❌ | Chosen components |
| `data_flow_description` | `string` | ✅ | How data flows through the system |
| `tradeoff_discussion` | `string` | ❌ | The candidate's tradeoff discussion |
| `scalability_discussion` | `string` | ❌ | The candidate's scalability discussion |
| `time_taken_minutes` | `integer` (≥ 0) | ✅ | Total time taken |

**`ComponentChoice` fields**: `component` (required), `choice` (required), `reason`.

**Example request**:

```bash
curl -X POST http://localhost:8000/swe/system-design/designs/score \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "problem_statement": "Design a URL shortener like bit.ly.",
    "difficulty_level": "senior",
    "requirements_clarification": "Asked about traffic, analytics, and URL expiry.",
    "high_level_design": "Load balancer, API servers, Redis cache, PostgreSQL, Kafka for analytics.",
    "component_choices": [
      {"component": "Database", "choice": "PostgreSQL", "reason": "Relational data, ACID"},
      {"component": "Cache", "choice": "Redis", "reason": "Fast lookups, TTL support"}
    ],
    "data_flow_description": "Read: API, Redis, then DB on a miss. Write: encode, DB, then async analytics through Kafka.",
    "tradeoff_discussion": "Chose CP for URL mappings because correctness matters more than availability.",
    "scalability_discussion": "Sharded the database by hash of short code, with read replicas.",
    "time_taken_minutes": 40
  }'
```

**Response** (`DesignScoreResponse`), abbreviated:

```json
{
  "overall_score": 74.0,
  "grade": "Hire",
  "dimension_scores": {
    "requirements_clarification": 70.0,
    "high_level_design": 78.0,
    "component_knowledge": 80.0,
    "data_modeling": 60.0,
    "api_design": 65.0,
    "tradeoff_awareness": 75.0,
    "scalability_thinking": 72.0,
    "communication": 80.0,
    "problem_solving": 68.0
  },
  "level_assessment": {
    "demonstrated_level": "senior",
    "target_level": "senior",
    "is_match": true,
    "reasoning": "Solid tradeoff and scaling discussion for a senior candidate."
  },
  "strengths": ["Clear CP reasoning"],
  "weaknesses": ["Thin data model"],
  "red_flags": [],
  "positive_signals": ["Named failure modes unprompted"],
  "comparison_to_expected": "Covers the main components but skips the API design.",
  "detailed_feedback": "A strong senior-level answer. Spend more time on the data model and the public API.",
  "improvement_roadmap": [
    {
      "area": "Data modeling",
      "current_level": "Mentions a table",
      "target_level": "Designs keys, indexes, and access patterns",
      "how_to_improve": "Practise schema design for two or three systems.",
      "priority": "high"
    }
  ],
  "would_pass_interview": true,
  "follow_up_topics": ["Schema design for URL analytics", "Cache stampede handling"]
}
```

`grade` is one of `Strong Hire`, `Hire`, `Weak Hire`, `No Hire`, or `Strong No Hire`.

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing or invalid `X-API-Key` header, when `API_KEY` is set |
| `422` | FastAPI validation error list | Missing or invalid field, such as an unknown `difficulty` or a `time_taken_minutes` below zero |
| `500` | `Failed to generate the system design result.` | The AI pipeline failed or returned output that does not match the schema |

**Example 500:**

```json
{
  "detail": "Failed to generate the system design result."
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
