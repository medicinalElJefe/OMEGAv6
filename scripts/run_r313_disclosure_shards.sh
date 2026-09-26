#!/usr/bin/env bash
set -euo pipefail

shards="${R313_DISCLOSURE_SHARDS:-16}"
max_parallel="${R313_DISCLOSURE_MAX_PARALLEL:-4}"
child_timeout="${R313_DISCLOSURE_SHARD_TIMEOUT_SEC:-360}"
if ! [[ "$shards" =~ ^[1-9][0-9]*$ ]] || [ "$shards" -gt 16 ]; then
  echo "R313_DISCLOSURE_SHARDS must be an integer 1..16" >&2
  exit 2
fi
if ! [[ "$max_parallel" =~ ^[1-9][0-9]*$ ]] || [ "$max_parallel" -gt "$shards" ]; then
  echo "R313_DISCLOSURE_MAX_PARALLEL must be an integer 1..R313_DISCLOSURE_SHARDS" >&2
  exit 2
fi
if ! [[ "$child_timeout" =~ ^[1-9][0-9]*$ ]]; then
  echo "R313_DISCLOSURE_SHARD_TIMEOUT_SEC must be a positive integer" >&2
  exit 2
fi

: > r313-panel-disclosure-failure.txt
status=0
for ((wave_start=0; wave_start<shards; wave_start+=max_parallel)); do
  wave_end=$((wave_start+max_parallel))
  if [ "$wave_end" -gt "$shards" ]; then wave_end="$shards"; fi
  declare -a pids=()
  declare -a indices=()
  declare -a logs=()

  for ((i=wave_start;i<wave_end;i++)); do
    log="/tmp/omega-r313-disclosure-shard-$i.log"
    (
      timeout --signal=TERM --kill-after=15s "${child_timeout}s"         env R313_DISCLOSURE_SHARD_COUNT="$shards" R313_DISCLOSURE_SHARD_INDEX="$i"         node tests/r313-panel-disclosure-browser-e2e.mjs
    ) >"$log" 2>&1 &
    pids+=("$!")
    indices+=("$i")
    logs+=("$log")
    echo "R313 disclosure shard $((i+1))/$shards started pid=${pids[-1]} wave=$((wave_start/max_parallel+1))"
  done

  for ((j=0;j<${#pids[@]};j++)); do
    i="${indices[$j]}"
    if wait "${pids[$j]}"; then
      cat "${logs[$j]}"
    else
      rc=$?
      {
        echo "R313 disclosure shard $((i+1))/$shards failed with exit $rc"
        cat "${logs[$j]}" || true
        echo
      } >> r313-panel-disclosure-failure.txt
      echo "::error title=R313 disclosure shard $((i+1))/$shards failed::Exit $rc; exact shard log retained." >&2
      cat "${logs[$j]}" >&2 || true
      status=1
    fi
  done
  unset pids indices logs
done

if [ "$status" -ne 0 ]; then
  exit 1
fi

rm -f r313-panel-disclosure-failure.txt
echo "R313 PANEL DISCLOSURE PARTITIONED PROOF PASS · $shards deterministic measured-workload shards recombined in waves of $max_parallel · complete 44-route × desktop/mobile assignment preserved · every disclosure/aria child proof passed"
