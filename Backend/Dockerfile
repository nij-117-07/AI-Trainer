# syntax=docker/dockerfile:1

# ──────────────────────────────────────────────
# Stage 1 — build dependencies with uv
# ──────────────────────────────────────────────
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never \
    UV_CACHE_DIR=/root/.cache/uv

WORKDIR /app

# Install dependencies first so this layer is cached
# until pyproject.toml / uv.lock actually change.
COPY pyproject.toml uv.lock .python-version ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Then copy the application source
COPY . .

# ──────────────────────────────────────────────
# Stage 2 — runtime image
# ──────────────────────────────────────────────
FROM python:3.12-slim-bookworm AS runtime

ENV PATH=/app/.venv/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HOST=0.0.0.0 \
    PORT=8000

WORKDIR /app

COPY --from=builder /app /app

# Writable dir for grader / roleplay / ingredients / vision uploads
RUN useradd --create-home --uid 1000 appuser \
    && mkdir -p /app/Data \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD python -c "import os,urllib.request;urllib.request.urlopen(f'http://127.0.0.1:{os.getenv(\"PORT\",\"8000\")}/health', timeout=4)"

CMD ["sh", "-c", "uvicorn main:app --host ${HOST:-0.0.0.0} --port ${PORT:-8000} --workers ${WEB_CONCURRENCY:-1}"]
