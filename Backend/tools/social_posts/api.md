# Social Media Post Generator API

Base path: `/tools/social_posts`
Tag: `Social Media Post Generator`

## Endpoints

### `POST /tools/social_posts/generate`

Generates platform-specific social media post suggestions (with designer notes) based on the brand voice, platform, topic, and liked-post style examples.

**Request body** (`SocialPostRequest`):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `system_prompt` | `string` | ✅ | The persona and brand voice rules |
| `platform` | `string` | ✅ | Target platform (e.g., `LinkedIn`, `X`, `Instagram`, `Thread`) |
| `user_query` | `string` | ✅ | The core topic or goal for the post |
| `chat_history` | `string` | ❌ | Past interactions to maintain context |
| `liked_post_examples` | `string` | ❌ | Examples of posts the user liked for style matching |
| `num_suggestions` | `int` | ❌ | Number of post variants to generate (1-10, default: `3`) |

**Example request**:

```bash
curl -X POST http://localhost:8000/tools/social_posts/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <your-key>" \
  -d '{
    "system_prompt": "You are a witty, tech-savvy ghostwriter for SaaS founders on LinkedIn.",
    "platform": "LinkedIn",
    "user_query": "The importance of failing fast in software development.",
    "chat_history": "Earlier we discussed lean startup methodologies.",
    "liked_post_examples": "Post 1: 'Stop building, start breaking things.' | Post 2: 'Complexity is the enemy of execution.'",
    "num_suggestions": 2
  }'
```

**Response** (`SocialPostResponse`):

```json
{
  "user_message": "Here are two LinkedIn angles...",
  "post_suggestions": [
    {
      "variant_id": "1",
      "content": "We spent 6 months building a feature nobody wanted...",
      "designer_notes": "Uses a failure story hook that resonates with founder audiences..."
    }
  ]
}
```

**Response fields** (`PostSuggestion` per item):

| Field | Type | Description |
|-------|------|-------------|
| `user_message` | `string` | A friendly, conversational message explaining the strategy behind these posts |
| `variant_id` | `string` | A number or label (e.g., `1`) |
| `content` | `string` | The actual post body content |
| `designer_notes` | `string` | Why this post works for the platform |

---

## Error responses

All endpoints return a JSON body on failure.

| Status | Detail | Description |
|--------|--------|-------------|
| `401` | `Invalid or missing API key` | Missing/invalid `X-API-Key` header |
| `422` | `validation_error` | Pydantic request validation failed |
| `500` | `Failed to generate the social media posts.` | Internal AI processing failure |

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

### `SocialPostRecord`

Data contract for tracking a generation run (persistence not yet wired up).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique generation identifier |
| `platform` | `string` | Target platform (e.g., LinkedIn, X, Instagram) |
| `user_query` | `string` | The core topic or goal for the post |
| `chat_history` | `string` | Past interactions for context |
| `liked_post_examples` | `string` | Style reference posts |
| `num_suggestions` | `int` | Number of variants requested |
| `user_message` | `string` | Strategy explanation message |
| `post_suggestions` | `object[]` | The generated post variants |
| `created_at` | `datetime` | Record creation timestamp |
| `updated_at` | `datetime` | Last-updated timestamp |
| `is_active` | `bool` | Whether the record is active |
