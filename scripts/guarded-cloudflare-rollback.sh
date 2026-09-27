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

decision="$(node - "$tmp" "$CANDIDATE_VERSION_ID" "$PREVIOUS_VERSION_ID" <<'NODE'
const fs=require('fs');
const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const candidate=process.argv[3],previous=process.argv[4];
const rows=[];
function walk(v){
  if(!v||typeof v!=='object')return;
  if(Array.isArray(v)){for(const x of v)walk(x);return}
  const id=typeof v.version_id==='string'?v.version_id:(typeof v.versionId==='string'?v.versionId:null);
  const raw=v.percentage??v.traffic_percentage??v.trafficPercentage;
  const pct=Number(raw);
  if(id&&Number.isFinite(pct))rows.push({id,pct});
  for(const x of Object.values(v))walk(x);
}
walk(data);
const serving=rows.filter(x=>x.pct>0.001);
const stable=serving.filter(x=>x.pct>=99.999);
const unique=[...new Map(serving.map(x=>[`${x.id}:${x.pct}`,x])).values()];
if(stable.length===1&&unique.length===1){
  const id=stable[0].id;
  if(id===previous){process.stdout.write('ALREADY_PREVIOUS');process.exit(0)}
  if(id===candidate){process.stdout.write('ROLLBACK_CANDIDATE');process.exit(0)}
  process.stdout.write('NEWER_OR_FOREIGN');
  process.exit(0);
}
process.stdout.write('AMBIGUOUS_DEPLOYMENT');
NODE
)"

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
