#!/usr/bin/env bash
set -Eeuo pipefail

: "${OMEGA_PUBLIC_URL:?OMEGA_PUBLIC_URL is required}"
: "${GITHUB_SHA:?GITHUB_SHA is required}"
WORKER_NAME="${OMEGA_WORKER_NAME:-omegav6}"
TMP_DIR="$(mktemp -d)"
STATUS_JSON="$TMP_DIR/deployment-status.json"
WRANGLER_NDJSON="$TMP_DIR/wrangler-output.ndjson"
PREVIOUS_VERSION_ID=''
CANDIDATE_VERSION_ID=''

cleanup(){ rm -rf "$TMP_DIR"; }
restore_previous_on_error(){
  local rc=$?
  trap - ERR
  set +e
  if [[ -n "$PREVIOUS_VERSION_ID" ]]; then
    echo "Staged release failed; restoring previous production version $PREVIOUS_VERSION_ID to 100% traffic."
    npx wrangler versions deploy "${PREVIOUS_VERSION_ID}@100%" --name "$WORKER_NAME" --message "OMEGA fail-closed staged release restore after $GITHUB_SHA" -y
  fi
  cleanup
  exit "$rc"
}
trap restore_previous_on_error ERR
trap cleanup EXIT

npx wrangler deployments status --name "$WORKER_NAME" --json > "$STATUS_JSON"
PREVIOUS_VERSION_ID="$(node - "$STATUS_JSON" <<'NODE'
const fs=require('fs');
const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const rows=[];
const seen=new Set();
function walk(value){
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){for(const x of value)walk(x);return}
  const id=typeof value.version_id==='string'?value.version_id:(typeof value.versionId==='string'?value.versionId:null);
  const raw=value.percentage??value.traffic_percentage??value.trafficPercentage;
  const pct=Number(raw);
  if(id&&Number.isFinite(pct)){
    const key=`${id}:${pct}`;
    if(!seen.has(key)){seen.add(key);rows.push({id,pct})}
  }
  for(const x of Object.values(value))walk(x);
}
walk(data);
const serving=rows.filter(x=>x.pct>0);
const stable=serving.filter(x=>x.pct>=99.999);
if(stable.length!==1||serving.length!==1)throw new Error(`fail-closed: expected exactly one current 100% production Worker version, received ${JSON.stringify(serving)}`);
process.stdout.write(stable[0].id);
NODE
)"
test -n "$PREVIOUS_VERSION_ID"
echo "Production invariant captured: $PREVIOUS_VERSION_ID remains the only serving version."

rm -f "$WRANGLER_NDJSON"
WRANGLER_OUTPUT_FILE_PATH="$WRANGLER_NDJSON" npx wrangler versions upload --name "$WORKER_NAME" --message "OMEGA staged candidate $GITHUB_SHA"
CANDIDATE_VERSION_ID="$(node - "$WRANGLER_NDJSON" <<'NODE'
const fs=require('fs');
const lines=fs.readFileSync(process.argv[2],'utf8').split(/\r?\n/).filter(Boolean);
const rows=lines.map(line=>JSON.parse(line));
const hit=[...rows].reverse().find(x=>x?.type==='version-upload'&&typeof x?.version_id==='string');
if(!hit)throw new Error('Wrangler version-upload receipt with version_id was not returned');
process.stdout.write(hit.version_id);
NODE
)"
test -n "$CANDIDATE_VERSION_ID"
test "$CANDIDATE_VERSION_ID" != "$PREVIOUS_VERSION_ID"
echo "Candidate uploaded without production traffic: $CANDIDATE_VERSION_ID"

echo "Candidate remains undeployed; proving exact uploaded version through Cloudflare version override while normal traffic remains on $PREVIOUS_VERSION_ID."
OMEGA_WORKER_VERSION_ID="$CANDIDATE_VERSION_ID" OMEGA_WORKER_NAME="$WORKER_NAME" node scripts/verify_staged_release.mjs

npm install --no-save playwright@1.63.0
npx playwright install --with-deps chromium
OMEGA_E2E_URL="$OMEGA_PUBLIC_URL" OMEGA_EXPECTED_SHA="${OMEGA_PROMOTED_SHA:-$GITHUB_SHA}" OMEGA_WORKER_VERSION_ID="$CANDIDATE_VERSION_ID" OMEGA_WORKER_NAME="$WORKER_NAME" node tests/r200-current-browser-proof-e2e.mjs

echo "Off-traffic semantic + browser proof passed; promoting exact candidate atomically. No mixed-version traffic split is used, so Durable Object export-set changes cannot violate Cloudflare gradual-deployment compatibility."
npx wrangler versions deploy "${CANDIDATE_VERSION_ID}@100%" --name "$WORKER_NAME" --message "OMEGA exact proved promotion $GITHUB_SHA" -y

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "previous_version_id=$PREVIOUS_VERSION_ID"
    echo "candidate_version_id=$CANDIDATE_VERSION_ID"
    echo "staged_proof=PASS"
  } >> "$GITHUB_OUTPUT"
fi

echo "OMEGA STAGED PROMOTION PASS · stable $PREVIOUS_VERSION_ID → proved candidate $CANDIDATE_VERSION_ID · source $GITHUB_SHA"
