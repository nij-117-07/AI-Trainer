#!/usr/bin/env bash

# --- Strict Mode ---
# -e: Exit on error
# -u: Exit on unset variables
# -o pipefail: Catch errors in pipelines
set -euo pipefail

# --- Configuration (Constants) ---
DEFAULT_PORT="18053"
DEFAULT_HOST="0.0.0.0"
DEFAULT_ENTRY="main:app"
VENV_DIR=".venv"
REQUIREMENTS_FILE="requirements.txt"

# --- Logger Functions ---
log_info() { printf "\e[34m[INFO]\e[0m %s\n" "$1"; }
log_success() { printf "\e[32m[SUCCESS]\e[0m %s\n" "$1"; }
log_warn() { printf "\e[33m[WARN]\e[0m %s\n" "$1"; }
log_error() { printf "\e[31m[ERROR]\e[0m %s\n" "$2" >&2; exit "$1"; }

# --- Dependency Management Logic ---

setup_environment() {
    if ! command -v python3 >/dev/null 2>&1; then
        log_error 1 "python3 not found. Please install Python."
    fi

    if [[ ! -d "$VENV_DIR" ]]; then
        log_info "Creating virtual environment with venv..."
        python3 -m venv "$VENV_DIR"
    fi

    # Activate venv for pip operations
    # shellcheck disable=SC1091
    source "$VENV_DIR/bin/activate"

    log_info "Installing dependencies with pip..."
    pip install --upgrade pip
    
    if [[ -f "$REQUIREMENTS_FILE" ]]; then
        pip install -r "$REQUIREMENTS_FILE"
    else
        log_warn "No $REQUIREMENTS_FILE found, skipping install."
    fi
    
    # Ensure uvicorn is present
    if ! command -v uvicorn >/dev/null 2>&1; then
        log_info "Installing uvicorn..."
        pip install uvicorn
    fi
}

run_server() {
    local host=$1
    local port=$2
    local entry=$3

    log_success "Starting server at http://$host:$port"
    
    # Using the absolute path to the virtual environment binary ensures reliability
    exec "$VENV_DIR/bin/uvicorn" "$entry" --host "$host" --port "$port"
}

# --- Main Logic ---

main() {
    # Configuration via Env Vars or Defaults
    local host="${APP_HOST:-$DEFAULT_HOST}"
    local port="${APP_PORT:-$DEFAULT_PORT}"
    local entry="${APP_ENTRY:-$DEFAULT_ENTRY}"
    
    # 1. Setup Env and Deps
    setup_environment
    
    # 2. Launch
    run_server "$host" "$port" "$entry"
}

# Pass all script arguments to main
main "$@"