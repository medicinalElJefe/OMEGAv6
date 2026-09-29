#!/usr/bin/env bash
set -euo pipefail
exec env \
 R408_PROOF_CLASS=no_dead_control \
 R408_SHARD_COUNT="${R286_PROOF_SHARDS:-8}" \
 R408_MAX_PARALLEL="${R286_SHARD_MAX_PARALLEL:-4}" \
 R408_CHILD_TIMEOUT_SEC="${R286_SHARD_TIMEOUT_SEC:-270}" \
 R408_COUNT_ENV=R286_SHARD_COUNT \
 R408_INDEX_ENV=R286_SHARD_INDEX \
 R408_LOG_PREFIX=omega-r286-shard \
 R408_RESOURCE_CAPACITY=4 \
 R408_SHARD_RESOURCE_COST=1 \
 R408_CHILD_COMMAND='node tests/r286-all-surface-no-dead-controls-ci-wrapper.mjs' \
 node scripts/run_work_conserving_shards_r408.mjs
