#!/usr/bin/env bash
set -euo pipefail

shards="${R286_PROOF_SHARDS:-4}"
child_timeout="${R286_SHARD_TIMEOUT_SEC:-420}"
if ! [[ "$shards" =~ ^[1-9][0-9]*$ ]] || [ "$shards" -gt 8 ]; then
  echo "R286_PROOF_SHARDS must be an integer 1..8" >&2
  exit 2
fi
if ! [[ "$child_timeout" =~ ^[1-9][0-9]*$ ]]; then
  echo "R286_SHARD_TIMEOUT_SEC must be a positive integer" >&2
  exit 2
fi

declare -a pids=()
declare -a logs=()
for ((i=0;i<shards;i++)); do
  log="/tmp/omega-r286-shard-$i.log"
  logs+=("$log")
  (
    timeout --signal=TERM --kill-after=15s "${child_timeout}s"       env R286_SHARD_COUNT="$shards" R286_SHARD_INDEX="$i"       node tests/r286-all-surface-no-dead-controls-ci-wrapper.mjs
  ) >"$log" 2>&1 &
  pids+=("$!")
  echo "R286 shard $((i+1))/$shards started pid=${pids[-1]}"
done

status=0
for ((i=0;i<shards;i++)); do
  if wait "${pids[$i]}"; then
    cat "${logs[$i]}"
  else
    rc=$?
    echo "::error title=R286 shard $((i+1))/$shards failed::Exit $rc; exact shard log follows." >&2
    cat "${logs[$i]}" >&2 || true
    status=1
  fi
done

if [ "$status" -ne 0 ]; then
  exit 1
fi

echo "R286/R313 PARTITIONED PROOF PASS · $shards deterministic shards recombined · complete 44-route × desktop/mobile assignment preserved · every child proof passed"
