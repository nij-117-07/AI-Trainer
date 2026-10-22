#!/usr/bin/env bash

# --- Strict Mode ---
set -euo pipefail

# --- Configuration (Constants) ---
# Users can modify these defaults
DEFAULT_PORT="12064"
DEFAULT_HOST="0.0.0.0"
DEFAULT_MODE="dev" # Options: dev, prod

# --- Logger Functions ---
log_info() { printf "\e[34m[INFO]\e[0m %s\n" "$1"; }
log_success() { printf "\e[32m[SUCCESS]\e[0m %s\n" "$1"; }
log_warn() { printf "\e[33m[WARN]\e[0m %s\n" "$1"; }
log_error() { printf "\e[31m[ERROR]\e[0m %s\n" "$2" >&2; exit "$1"; }

# --- Helper Functions ---

check_dependencies() {
    log_info "Verifying system requirements..."
    
    if ! command -v pnpm >/dev/null 2>&1; then
        log_error 1 "pnpm is not installed. Please install it first: https://pnpm.io/installation"
    fi

    if [[ ! -f "package.json" ]]; then
        log_error 1 "No package.json found in the current directory. Are you in the right folder?"
    fi
}

install_node_modules() {
    if [[ ! -d "node_modules" ]]; then
        log_warn "node_modules not found. Running 'pnpm install'..."
        pnpm install || log_error 1 "Failed to install dependencies."
        log_success "Dependencies installed."
    fi
}

run_dev() {
    local port=$1
    local host=$2
    log_info "Starting development server on $host:$port..."
    # Next.js and most Node scripts respect the PORT env variable
    PORT="$port" HOST="$host" pnpm run dev
}

run_prod() {
    local port=$1
    local host=$2
    
    log_info "Preparing production build..."
    pnpm run build || log_error 1 "Build failed. Fix the errors before running production."
    
    log_info "Starting production server on $host:$port..."
    PORT="$port" HOST="$host" pnpm run start
}

# --- Main Logic ---

main() {
    # Provide local variables that can be overridden by environment or script edits
    local mode="${APP_MODE:-$DEFAULT_MODE}"
    local port="${APP_PORT:-$DEFAULT_PORT}"
    local host="${APP_HOST:-$DEFAULT_HOST}"

    check_dependencies
    install_node_modules

    case "${mode,,}" in # ,, converts to lowercase in Bash 4+
        "dev")
            run_dev "$port" "$host"
            ;;
        "prod"|"production")
            run_prod "$port" "$host"
            ;;
        *)
            log_error 1 "Invalid mode: $mode. Use 'dev' or 'prod'."
            ;;
    esac
}

# Execute script
main "$@"