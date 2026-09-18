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
  if [[ -n "$PREVIOUS_VERSION_ID" && "${BASELINE_USABLE:-0}" == "1" ]]; then
    echo "Staged release failed; restoring verified-usable previous production version $PREVIOUS_VERSION_ID to 100% traffic."
    npx wrangler versions deploy "${PREVIOUS_VERSION_ID}@100%" --name "$WORKER_NAME" --message "OMEGA fail-closed staged release restore after $GITHUB_SHA" -y
  elif [[ -n "$PREVIOUS_VERSION_ID" ]]; then
    echo "::error title=ROLLBACK REFUSED::Previous version $PREVIOUS_VERSION_ID is the positively identified application-withholding interlock. R319.8 refuses to falsely label/redeploy it as last-known-good; existing traffic is left unchanged while the failed candidate remains off-traffic."
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

# R319.9 rollback usability authority: serving traffic is not proof that the
# product is usable.  Probe the live HTML plus same-origin JavaScript bundle
# graph so a client-rendered R211/R205/R216 interlock cannot hide behind a
# harmless index.html shell.  Unknown/unreadable surfaces do not receive
# last-known-good authority.
BASELINE_USABLE=0
BASELINE_PROBE_JSON="$TMP_DIR/baseline-usability.json"
# The usability probe intentionally uses non-zero exit states to distinguish
# a positively identified interlock (42) from an indeterminate surface (3).
# Run it as an if-condition so Bash's global ERR trap does not misclassify
# those expected probe states as a release failure before candidate upload.
if node scripts/probe_live_usability_r3199.mjs "$OMEGA_PUBLIC_URL" "$GITHUB_SHA" > "$BASELINE_PROBE_JSON"; then
  BASELINE_PROBE_RC=0
else
  BASELINE_PROBE_RC=$?
fi
cat "$BASELINE_PROBE_JSON" || true
if [[ "$BASELINE_PROBE_RC" == "0" ]]; then
  BASELINE_USABLE=1
  echo "Production baseline proved free of known application-withholding interlocks: $PREVIOUS_VERSION_ID."
elif [[ "$BASELINE_PROBE_RC" == "42" ]]; then
  echo "::error title=UNUSABLE PRODUCTION BASELINE::Current 100% Worker $PREVIOUS_VERSION_ID serves the obsolete R211/R205/R216 application-withholding interlock and has no rollback authority."
else
  echo "::warning title=ROLLBACK USABILITY UNPROVED::Current 100% Worker $PREVIOUS_VERSION_ID could not be proved usable. It will not be treated as last-known-good during this release."
fi

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

# Cloudflare version overrides can target only a version that belongs to the
# current deployment. Admit the candidate at 0% while keeping all ordinary
# user traffic on the previous version. The override header below is then the
# only path that can reach the candidate before proof.
echo "Admitting exact candidate to the current deployment at 0% traffic while $PREVIOUS_VERSION_ID remains at 100%."
npx wrangler versions deploy "${PREVIOUS_VERSION_ID}@100%" "${CANDIDATE_VERSION_ID}@0%" --name "$WORKER_NAME" --message "OMEGA off-traffic staged candidate $GITHUB_SHA" -y

STAGED_DEPLOYMENT_READY=0
for attempt in $(seq 1 12); do
  npx wrangler deployments status --name "$WORKER_NAME" --json > "$STATUS_JSON"
  if node - "$STATUS_JSON" "$PREVIOUS_VERSION_ID" "$CANDIDATE_VERSION_ID" <<'NODE'
const fs=require('fs');
const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const previousId=process.argv[3],candidateId=process.argv[4],rows=[];
function walk(value){
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){for(const x of value)walk(x);return}
  const id=typeof value.version_id==='string'?value.version_id:(typeof value.versionId==='string'?value.versionId:null);
  const raw=value.percentage??value.traffic_percentage??value.trafficPercentage;
  const pct=Number(raw);
  if(id&&Number.isFinite(pct))rows.push({id,pct});
  for(const x of Object.values(value))walk(x);
}
walk(data);
const previousReady=rows.some(x=>x.id===previousId&&x.pct>=99.999);
const candidateReady=rows.some(x=>x.id===candidateId&&Math.abs(x.pct)<=0.001);
const unexpectedServing=rows.filter(x=>x.id!==previousId&&x.pct>0.001);
if(!previousReady||!candidateReady||unexpectedServing.length)process.exit(1);
NODE
  then
    STAGED_DEPLOYMENT_READY=1
    echo "Staged deployment membership confirmed on attempt $attempt: previous 100%, candidate 0%."
    break
  fi
  sleep 2
done
if [[ "$STAGED_DEPLOYMENT_READY" != "1" ]]; then
  echo "::error title=STAGED DEPLOYMENT NOT READY::Candidate $CANDIDATE_VERSION_ID was not observed at 0% beside previous $PREVIOUS_VERSION_ID at 100%."
  false
fi

# Give Cloudflare's version-override routing a bounded propagation interval
# after current-deployment membership is observed.
sleep 2
echo "Proving exact 0%-traffic candidate through Cloudflare version override; normal user traffic remains on $PREVIOUS_VERSION_ID."
OMEGA_WORKER_VERSION_ID="$CANDIDATE_VERSION_ID" OMEGA_WORKER_NAME="$WORKER_NAME" node scripts/verify_staged_release.mjs

npm install --no-save playwright@1.63.0
npx playwright install --with-deps chromium
OMEGA_E2E_URL="$OMEGA_PUBLIC_URL" OMEGA_EXPECTED_SHA="${OMEGA_PROMOTED_SHA:-$GITHUB_SHA}" OMEGA_WORKER_VERSION_ID="$CANDIDATE_VERSION_ID" OMEGA_WORKER_NAME="$WORKER_NAME" node tests/r200-current-browser-proof-e2e.mjs

echo "Off-traffic semantic + browser proof passed; promoting exact candidate to 100%."
npx wrangler versions deploy "${CANDIDATE_VERSION_ID}@100%" --name "$WORKER_NAME" --message "OMEGA exact proved promotion $GITHUB_SHA" -y

ROLLBACK_ELIGIBLE=false
if [[ "$BASELINE_USABLE" == "1" ]]; then ROLLBACK_ELIGIBLE=true; fi
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "previous_version_id=$PREVIOUS_VERSION_ID"
    echo "candidate_version_id=$CANDIDATE_VERSION_ID"
    echo "staged_proof=PASS"
    echo "rollback_eligible=$ROLLBACK_ELIGIBLE"
  } >> "$GITHUB_OUTPUT"
fi

echo "OMEGA STAGED PROMOTION PASS · previous $PREVIOUS_VERSION_ID → proved candidate $CANDIDATE_VERSION_ID · source $GITHUB_SHA · rollback_eligible $ROLLBACK_ELIGIBLE"
