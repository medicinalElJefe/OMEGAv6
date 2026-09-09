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
