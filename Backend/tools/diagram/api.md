# Diagram Generator API

Base path: `/tools/diagram`
Tag: `Diagram Generator`

## Endpoints

### `POST /tools/diagram/generate`

Generates or edits diagram code in **Mermaid.js** or **Draw.io (diagrams.net)** format from a natural-language instruction and optional existing code. Passing `existing_code` refines it; leaving it empty generates a diagram from scratch.

**Request body** (`DiagramRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `format` | `string` | ✅ | One of: `mermaid`, `drawio` |
| `instruction` | `string` | ✅ | Specific visual change or diagram request |
| `context` | `string` | ❌ | Business logic or technical context for the diagram content (default: empty) |
| `existing_code` | `string` | ❌ | Existing diagram code to refine (default: empty — generate from scratch) |

**Example request (Mermaid)**:

```bash
curl -X POST http://localhost:8000/tools/diagram/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "format": "mermaid",
    "instruction": "Flowchart of the login flow",
    "context": "User enters credentials, the system validates them, then routes to dashboard or shows an error."
  }'
```

**Response** (`DiagramResponse`):

```json
{
  "message": "Created a flowchart with three decision branches.",
  "code": "graph TD\n  A[User enters credentials] --> B{Valid?}\n  B -- Yes --> C[Dashboard]\n  B -- No --> D[Show error]",
  "format": "mermaid",
  "status": "success"
}
```

**Example request (Draw.io)**:

```bash
curl -X POST http://localhost:8000/tools/diagram/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "format": "drawio",
    "instruction": "Two-box architecture with an arrow between them",
    "context": "Client app and backend API"
  }'
```

**Response fields**:

| Field | Type | Description |
|-------|------|-------------|
| `message` | `string` | A brief explanation of what was added or changed |
| `code` | `string` | The final valid diagram code (Mermaid syntax or Draw.io XML/mxGraph) |
| `format` | `string` | The format returned: `mermaid` or `drawio` |
| `status` | `string` | Processing status (default: `success`) |

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed (including unsupported `format`) |
| `500` | `Failed to generate the diagram.` | Internal AI processing failure |

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

### `DiagramRecord`

Data contract for tracking a generated diagram (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique diagram generation identifier |
| `format` | `string` | Diagram format: `mermaid` or `drawio` |
| `instruction` | `string` | The user's diagram instruction |
| `context` | `string` | Technical or business context provided |
| `existing_code` | `string` | Prior diagram code that was modified |
| `answer_message` | `string` | Explanation of what was added or changed |
| `diagram_code` | `string` | The generated diagram code |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
