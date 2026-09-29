#!/usr/bin/env bash
set -euo pipefail
: > r313-panel-disclosure-failure.txt
set +e
env \
 R408_PROOF_CLASS=disclosure \
 R408_SHARD_COUNT="${R313_DISCLOSURE_SHARDS:-16}" \
 R408_MAX_PARALLEL="${R313_DISCLOSURE_MAX_PARALLEL:-4}" \
 R408_CHILD_TIMEOUT_SEC="${R313_DISCLOSURE_SHARD_TIMEOUT_SEC:-360}" \
 R408_COUNT_ENV=R313_DISCLOSURE_SHARD_COUNT \
 R408_INDEX_ENV=R313_DISCLOSURE_SHARD_INDEX \
 R408_LOG_PREFIX=omega-r313-disclosure-shard \
 R408_RESOURCE_CAPACITY=4 \
 R408_SHARD_RESOURCE_COST=2 \
 R408_FAILURE_LEDGER=r313-panel-disclosure-failure.txt \
 R408_CHILD_COMMAND='node tests/r313-panel-disclosure-browser-e2e.mjs' \
 node scripts/run_work_conserving_shards_r408.mjs
rc=$?
set -e
if [ "$rc" -ne 0 ]; then
  echo "R408 disclosure scheduler failed; child diagnostics were emitted above." >> r313-panel-disclosure-failure.txt
  exit "$rc"
fi
rm -f r313-panel-disclosure-failure.txt
echo "R313 PANEL DISCLOSURE PARTITIONED PROOF PASS · work-conserving bounded scheduler · complete 44-route × desktop/mobile assignment preserved · every disclosure/aria child proof passed"
