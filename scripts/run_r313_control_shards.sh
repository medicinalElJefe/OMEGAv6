#!/usr/bin/env bash
set -euo pipefail
exec env \
 R408_PROOF_CLASS=interaction \
 R408_SHARD_COUNT="${R313_PROOF_SHARDS:-8}" \
 R408_MAX_PARALLEL="${R313_SHARD_MAX_PARALLEL:-4}" \
 R408_CHILD_TIMEOUT_SEC="${R313_SHARD_TIMEOUT_SEC:-270}" \
 R408_COUNT_ENV=R313_SHARD_COUNT \
 R408_INDEX_ENV=R313_SHARD_INDEX \
 R408_LOG_PREFIX=omega-r313-shard \
 R408_RESOURCE_CAPACITY=4 \
 R408_SHARD_RESOURCE_COST=2 \
 R408_CHILD_COMMAND='node tests/r313-full-control-interaction-browser-e2e.mjs' \
 node scripts/run_work_conserving_shards_r408.mjs
