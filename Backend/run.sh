#!/bin/bash

# 1. Load env files if they exist
# [ -f .env ] && export $(grep -v '^#' .env | xargs)

# 2. Set Defaults (Priority: Env Var > Default Value)
# FastAPI/Uvicorn defaults
HOST=${HOST:-"0.0.0.0"}
PORT=${PORT:-"8000"}
MODE=${MODE:-"prod"} # dev or prod

echo "------------------------------------------"
echo "FastAPI Configuration: $MODE mode"
echo "Address: http://$HOST:$PORT"
echo "------------------------------------------"

# 3. Check/Install Dependencies using uv
if [ ! -d ".venv" ]; then
    echo "📦 Virtual environment not found. Installing with uv..."
    uv sync
else
    # Optionally ensure sync is always up to date
    uv sync
fi

# 4. Execution Logic
if [ "$MODE" = "prod" ]; then
    echo "🚀 Starting Uvicorn in Production mode..."
    # In production, we typically disable reload and use more workers
    uv run uvicorn main:app \
        --host "$HOST" \
        --port "$PORT" \
        --workers 4
else
    echo "🚀 Starting Uvicorn in Development mode (Reload enabled)..."
    # In dev, we enable --reload
    uv run uvicorn main:app \
        --host "$HOST" \
        --port "$PORT" \
        --reload
fi