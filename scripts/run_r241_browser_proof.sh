#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: $0 '<browser proof command>'" >&2
  exit 2
fi

proof_command="$1"
base="${OMEGA_E2E_URL:-http://127.0.0.1:4173}"
proof_timeout="${OMEGA_BROWSER_PROOF_TIMEOUT_SEC:-300}"
log="/tmp/omega-r241-vite-${GITHUB_RUN_ID:-local}-${RANDOM}.log"
started_preview=0

if ! [[ "$proof_timeout" =~ ^[1-9][0-9]*$ ]]; then
  echo "OMEGA_BROWSER_PROOF_TIMEOUT_SEC must be a positive integer" >&2
  exit 2
fi

cleanup() {
  if [ "$started_preview" -eq 1 ] && [ -n "${preview_pid:-}" ]; then
    kill "$preview_pid" 2>/dev/null || true
    wait "$preview_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if curl -fsS --max-time 2 "$base/" >/dev/null 2>&1; then
  echo "R241 browser proof reusing healthy shared preview at $base"
else
  node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 >"$log" 2>&1 &
  preview_pid=$!
  started_preview=1
  ready=0
  for i in $(seq 1 30); do
    if curl -fsS --max-time 2 "$base/" >/dev/null 2>&1; then ready=1; break; fi
    if ! kill -0 "$preview_pid" 2>/dev/null; then
      cat "$log" >&2
      exit 1
    fi
    sleep 1
  done
  if [ "$ready" -ne 1 ]; then
    cat "$log" >&2
    echo "::error title=R241 preview readiness failure::Vite preview did not become healthy within 30 seconds." >&2
    exit 1
  fi
fi

echo "R241 browser proof command (bounded ${proof_timeout}s): $proof_command"
set +e
timeout --signal=TERM --kill-after=15s "${proof_timeout}s" env OMEGA_E2E_URL="$base" bash -lc "$proof_command"
status=$?
set -e

if [ "$status" -eq 124 ] || [ "$status" -eq 137 ]; then
  echo "::error title=R241 browser proof timeout::Command exceeded ${proof_timeout}s and was terminated fail-closed: $proof_command" >&2
  [ -f "$log" ] && cat "$log" >&2 || true
  exit 124
fi
exit "$status"
