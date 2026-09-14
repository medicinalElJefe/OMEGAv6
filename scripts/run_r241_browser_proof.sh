#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: $0 '<browser proof command>'" >&2
  exit 2
fi

proof_command="$1"
base="http://127.0.0.1:4173"
log="/tmp/omega-r241-vite-${GITHUB_RUN_ID:-local}-${RANDOM}.log"

cleanup() {
  if [ -n "${preview_pid:-}" ]; then
    kill "$preview_pid" 2>/dev/null || true
    wait "$preview_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

npx vite preview --host 127.0.0.1 --port 4173 >"$log" 2>&1 &
preview_pid=$!

for i in $(seq 1 30); do
  if curl -fsS "$base/" >/dev/null; then
    break
  fi
  if ! kill -0 "$preview_pid" 2>/dev/null; then
    cat "$log" >&2
    exit 1
  fi
  sleep 1
done

curl -fsS "$base/" >/dev/null || { cat "$log" >&2; exit 1; }
echo "R241 browser proof command: $proof_command"
OMEGA_E2E_URL="$base" bash -lc "$proof_command"
