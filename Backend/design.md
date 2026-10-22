# Design Guidelines & Checklist

Engineering rules enforced across this backend project. Every new module/feature must pass all items before it is considered done.

## Project structure

The backend is organized into **apps** (e.g. `practice/`, `learning/`). Each app groups related sub-features and is fully decoupled from the master entry. Each sub-feature lives in its own package under an app:

```
Backend/
├── main.py                     # Slim entry point — only includes app routers
├── design.md                   # This file — project-wide engineering rules
├── .env                        # Local secrets (gitignored)
├── .env.example                # Committed template of all config keys
├── core/
│   ├── config.py               # Reads .env, falls back to defaults (single LLM config)
│   └── security.py             # Shared API key auth guard (verify_api_key)
├── practice/
│   ├── router.py               # App aggregator — mounts every practice sub-feature
│   ├── debate/
│   │   ├── router.py           # APIRouter + endpoints
│   │   ├── schemas.py          # Pydantic v2 request/response models
│   │   ├── services.py         # Business logic (DSPy calls)
│   │   ├── dependencies.py     # Service injectors + auth re-exports
│   │   ├── models.py           # Data contracts for future DB integration
│   │   └── api.md              # API documentation
│   └── <next-feature>/
│       ├── router.py
│       ├── schemas.py
│       ├── services.py
│       ├── dependencies.py
│       ├── models.py
│       └── api.md
└── learning/
    ├── router.py               # App aggregator — mounts every learning sub-feature
    ├── explainer/              # router.py, schemas.py, services.py, dependencies.py, models.py, api.md
    └── roadmap/                # router.py, schemas.py, services.py, dependencies.py, models.py, api.md
```

## Apps

- An **app** is a top-level package with an aggregator router (`<app>/router.py`) that mounts all of its sub-features.
- Each app mounts under its own prefix: `practice/` → `/practice`, `learning/` → `/learning`.
- A feature's router prefix stays relative to its app (e.g. `roadmap` → `/roadmap`), producing the full path `/learning/roadmap/...`.
- `main.py` only knows the app routers, never individual features.

## Engineering rules (mandatory)

- [ ] **Type safety** — every function signature has explicit type hints; no bare `def foo(x):`.
- [ ] **Docstrings** — Google style (`Args:`, `Returns:`, `Raises:`) on all public functions and classes.
- [ ] **Logging** — use the `logging` module with `logger = logging.getLogger(__name__)` and lazy `%`-style formatting. No `print()` statements, no `f"{var}"` inside logging calls.
- [ ] **Validation** — all schemas use Pydantic v2 (`BaseModel`, `Field`, `Literal`, `Optional`).
- [ ] **Routing** — `APIRouter` with a `prefix` and `tags`. Prefix must match the package name.
- [ ] **Absolute imports** — always `from <app>.<feature>.xyz import ...`, never relative.
- [ ] **Slim `main.py`** — the master entry must only do `app.include_router(<app>_router)`; it never knows about individual features.
- [ ] **Errors (two layers)** — services raise module-level domain exceptions (e.g. `GenerationError`); routers map them to custom `HTTPException` subclasses. Never let raw exceptions reach the client.
- [ ] **Single LLM** — one shared `dspy.LM` built from `master_llm_config` in `core/config.py`. Do not introduce per-feature LLM/thinking-model config.

## Adding a new sub-feature (checklist)

1. Create `<app>/<feature>/` with `router.py`, `schemas.py`, `services.py`, `dependencies.py`, `models.py`, `api.md` (+ `__init__.py`).
2. Register the router in the app's `router.py` with one line:
   ```python
   from <app>.<feature>.router import router as <feature>_router
   <app>_router.include_router(<feature>_router)
   ```
3. Do **not** modify `main.py` (unless creating a new app, see below).
4. Add feature-specific config to `.env` and `.env.example`; expose them via `core/config.py` with defaults.
5. Write `api.md` documenting every endpoint (method, path, request/response tables, curl examples, error codes).

## Creating a new app (checklist)

Only create a new app when the feature does not fit an existing one (e.g. it is a new domain such as `practice`, `learning`, `assessment`).

1. Create `<newapp>/` with `__init__.py` and `router.py`:
   ```python
   from fastapi import APIRouter
   from <newapp>.<feature>.router import router as <feature>_router

   <newapp>_router = APIRouter(prefix="/<newapp>")
   <newapp>_router.include_router(<feature>_router)

   __all__ = ["<newapp>_router"]
   ```
2. Add one import + one `app.include_router(<newapp>_router)` line to `main.py`.

## Configuration rules

- All config is read from `.env` via `os.getenv(key, default)`.
- Every key must have a sensible default in `core/config.py` so the app boots without `.env`.
- Secrets never go in `.env.example` or into git.
- Logging verbosity is controlled by `LOG_LEVEL`; developers can set `LOG_LEVEL=DEBUG` without enabling FastAPI debug mode.
- Auth is opt-in: `verify_api_key` in `core/security.py` rejects requests without a matching `X-API-Key` only when `API_KEY` is set.

## File responsibility

| File | Owns | Must not do |
|------|------|-------------|
| `router.py` | HTTP endpoints, status codes, request → service wiring, mapping domain exceptions to `HTTPException` subclasses | Business logic, direct DSPy calls |
| `schemas.py` | Pydantic request/response models | Business logic |
| `services.py` | Business logic, DSPy orchestration, raising domain exceptions | HTTP concerns, `HTTPException` |
| `dependencies.py` | Dependency injection, auth guards (re-exported) | Endpoint definitions |
| `models.py` | Persistence data contracts | Business logic |
