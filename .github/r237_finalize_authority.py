from pathlib import Path

# Patch the actual Wrangler entrypoint's R117 bootstrap so existing-session rotation
# forwards the presented current secret while fresh unpaired bootstrap still works.
worker = Path('src/workerR116.js')
s = worker.read_text()
old = """ const cleanHeaders=new Headers({'content-type':'application/json','x-omega-session-id':sid});
 const pairResponse=await stub.fetch(new Request('https://omega-runtime.internal/pair',{method:'POST',headers:cleanHeaders,body:JSON.stringify({rotate:true})}));"""
new = """ const pairHeaders=new Headers({'content-type':'application/json','x-omega-session-id':sid});
 const currentSecret=text(request.headers.get('x-omega-bridge-secret'));
 if(currentSecret)pairHeaders.set('x-omega-bridge-secret',currentSecret);
 const pairResponse=await stub.fetch(new Request('https://omega-runtime.internal/pair',{method:'POST',headers:pairHeaders,body:JSON.stringify({rotate:true})}));"""
if old not in s:
    raise SystemExit('R237 finalizer refused: deployed R116 bootstrap preimage changed')
s = s.replace(old,new,1)
old_truth = "truthBoundary:'This endpoint rotates a fresh bridge credential directly in durable runtime state using only the canonical browser session. Stale browser bridge headers are ignored. PC ONLINE remains false until a real authenticated host heartbeat arrives.'"
new_truth = "truthBoundary:'This endpoint mints the first bridge credential for an unpaired canonical browser session or rotates an existing credential only when that session proves its current bridge secret. Cross-session or stale credentials cannot seize pairing authority. PC ONLINE remains false until a real authenticated host heartbeat arrives.'"
if old_truth not in s:
    raise SystemExit('R237 finalizer refused: deployed R116 bootstrap truth-boundary preimage changed')
worker.write_text(s.replace(old_truth,new_truth,1))

# Bind the R237 exact-promoted-SHA lifecycle verifier into the canonical single-writer
# production deployment after existing R202 live proof and before receipt closure.
ci = Path('.github/workflows/ci.yml')
c = ci.read_text()
anchor = """      - name: Verify live R202 operational source-authority surface
        run: node scripts/verify_live_operational_source_authority_r202.mjs
      - name: Record deployment receipt"""
replacement = """      - name: Verify live R202 operational source-authority surface
        run: node scripts/verify_live_operational_source_authority_r202.mjs
      - name: Verify live R237 authenticated Hybrid command authority
        run: node scripts/verify_live_hybrid_command_authority_r237.mjs
      - name: Record deployment receipt"""
if anchor not in c:
    raise SystemExit('R237 finalizer refused: canonical deployment acceptance anchor changed')
c = c.replace(anchor,replacement,1)
receipt_anchor = '            echo "- R202 archive residual debt remains explicit: AT09 desktop health check PLANNED; AT10 forensic hash ledger PLANNED"'
receipt_line = '            echo "- R237 exact promoted-SHA Hybrid command authority: unauthenticated rotation rejected; authenticated same-session rotation required; old secret revoked; rotated secret preserves device continuity; per-device backpressure and cancellation lifecycle proven; Home→TOOLS→Hybrid browser path proven"\n'
if receipt_anchor not in c:
    raise SystemExit('R237 finalizer refused: deployment receipt anchor changed')
c = c.replace(receipt_anchor,receipt_line+receipt_anchor,1)
ci.write_text(c)
