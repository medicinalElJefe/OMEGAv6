#!/usr/bin/env bash
set -Eeuo pipefail

: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
WORKER_NAME="${OMEGA_WORKER_NAME:-omegav6}"
CANDIDATE_VERSION_ID="${1:-}"
PREVIOUS_VERSION_ID="${2:-}"
MESSAGE="${3:-OMEGA guarded rollback}"

if [[ -z "$CANDIDATE_VERSION_ID" || -z "$PREVIOUS_VERSION_ID" ]]; then
  echo "::error title=ROLLBACK INPUT REQUIRED::guarded rollback requires candidate and previous Worker version IDs."
  exit 2
fi

tmp="$(mktemp)"
cleanup(){ rm -f "$tmp"; }
trap cleanup EXIT

npx wrangler deployments status --name "$WORKER_NAME" --json > "$tmp"

decision="$(node scripts/deployment-ownership-r366.mjs "$tmp" "$CANDIDATE_VERSION_ID" "$PREVIOUS_VERSION_ID")"

case "$decision" in
  ALREADY_PREVIOUS)
    echo "Guarded rollback: previous Worker $PREVIOUS_VERSION_ID is already the sole 100% serving version; no mutation required."
    ;;
  ROLLBACK_CANDIDATE)
    echo "Guarded rollback: current serving version is this run's candidate $CANDIDATE_VERSION_ID; restoring verified previous $PREVIOUS_VERSION_ID."
    npx wrangler versions deploy "${PREVIOUS_VERSION_ID}@100%" --name "$WORKER_NAME" --message "$MESSAGE" -y
    ;;
  NEWER_OR_FOREIGN)
    echo "::warning title=STALE ROLLBACK BLOCKED::Current production is no longer this run's candidate or previous baseline. A newer/foreign deployment owns traffic, so this run will not mutate it."
    ;;
  AMBIGUOUS_DEPLOYMENT)
    echo "::warning title=ROLLBACK OWNERSHIP UNPROVED::Current deployment is split or ambiguous. Rollback mutation is refused because this run cannot prove ownership of the serving version."
    ;;
  *)
    echo "::error title=ROLLBACK GUARD INTERNAL ERROR::Unknown guarded rollback decision: $decision"
    exit 3
    ;;
esac
