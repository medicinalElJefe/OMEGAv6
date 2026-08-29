const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

const RESTORATION = Object.freeze({
  branch: "full-restore",
  state: "IN_PROGRESS",
  lineageClassification: "PARALLEL_MIGRATION",
  donor: "hosted B058/V90",
  releaseAuthority: "Google Drive LATEST_OMEGA_UPDATE.json -> B015 R1",
  migratedExact: ["src/main.tsx", "src/index.css", "src/ResponsiveRuntimeShell.tsx", "src/responsiveShell.css", "src/hybridCommandRuntime.ts", "src/OmegaCommandDeck.tsx", "src/commandDeck.css", "src/promptOrchestrator.css", "src/localTraining.css"],
  migratedAdapted: ["src/App.tsx", "src/runtimeIdentity.ts", "src/platformAdapter.ts", "src/PromptOrchestrator.tsx", "src/worker.js", "package.json", "vite.config.ts", "wrangler.jsonc"],
  platformAdapter: "MIGRATED_ADAPTED",
  commandCenterSlice: "MIGRATED_NOT_YET_INTEGRATED",
  mergeGate: "BUILD_AND_INHERITANCE_PASS_REQUIRED",
  fullRestoreClaimed: false
});

const BUILD = Object.freeze({
  product: "OMEGAv6 Sovereign Cloud Runtime",
  deploymentLineage: "OMEGA B015 sovereign chain + hosted B058/V90 donor migration",
  acceptedDescendant: "R7 contextual continuity",
  publicAdapter: "R14 command-center donor migration",
  releaseAuthority: "Google Drive LATEST_OMEGA_UPDATE.json",
  deployBridge: "GitHub -> Cloudflare Workers",
  restorationBranch: RESTORATION.branch,
  restorationState: RESTORATION.state,
  appDeploy: false,
  generatedAt: "2026-08-28"
});

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: JSON_HEADERS });
}

function isBoundedRuntimeQuery(text) {
  const t = String(text || "").trim();
  return /^(?:status|health|version|build status|runtime status|provider status|bridge status|hybrid link status|heartbeat status|restoration status)\??$/i.test(t)
    || /^(?:what(?:'s| is)|show|check|get)\s+(?:the\s+)?(?:status|health|version|build status|runtime status|provider status|bridge status|hybrid link status|heartbeat status|restoration status)\??$/i.test(t);
}

function classify(text) {
  const t = String(text || "").trim();
  if (!t) return { route: "FAST_DETERMINISTIC", reason: "empty-input", modelInvocations: 0 };
  if (/\b(all modes|full modes|activate all modes)\b/i.test(t)) return { route: "ROUTED_MODEL_FULL", reason: "explicit-all-modes", modelInvocations: 0 };
  if (isBoundedRuntimeQuery(t)) return { route: "FAST_DETERMINISTIC", reason: "bounded-runtime-query", modelInvocations: 0 };
  if (/\b(repair|design|forecast|train|compare|analy[sz]e|deep|full|build|code|program|create|make|implement|upgrade|fix)\b/i.test(t)) return { route: "ROUTED_MODEL", reason: "synthesis-required", modelInvocations: 0 };
  return { route: "ROUTED_MODEL", reason: "conversational-synthesis", modelInvocations: 0 };
}

function statusPayload(env) {
  return {
    ok: true,
    build: BUILD,
    cloud: { worker: "LIVE", staticAssets: "BRANCH_BUILD_DEPENDENT", mergeTarget: "main" },
    canonicalAuthority: { source: "Google Drive", release: "B015 R1", state: "EXTERNAL_AUTHORITY", promotion: "POINTER_CONTROLLED" },
    modelProvider: env.OMEGA_MODEL_ENDPOINT ? "CONFIGURED_EXTERNAL" : "NOT_CONFIGURED",
    hybridLink: { state: "DEVICE_PROOF_REQUIRED", missionControlSurface: "MIGRATED_NOT_YET_INTEGRATED", nativeExecutionClaimed: false },
    earth: { state: "DONOR_UI_NOT_YET_MIGRATED", liveFeeds: "EXTERNAL_DEGRADED_UNTIL_BOUND" },
    restoration: RESTORATION,
    truthBoundary: "This branch is a parallel migration, not a completed full restore. No native/device/provider/live-feed capability is claimed without evidence."
  };
}

async function api(request, env, url) {
  if (url.pathname === "/api/health" && request.method === "GET") return json({ ok: true, service: BUILD.product, build: BUILD, restoration: { state: RESTORATION.state, fullRestoreClaimed: false }, now: new Date().toISOString() });
  if (url.pathname === "/api/status" && request.method === "GET") return json(statusPayload(env));
  if (url.pathname === "/api/restoration" && request.method === "GET") return json({ ok: true, ...RESTORATION, build: BUILD.publicAdapter, provider: env.OMEGA_MODEL_ENDPOINT ? "CONFIGURED_EXTERNAL" : "NOT_CONFIGURED", nativeHost: "DEVICE_PROOF_REQUIRED", earthFeeds: "EXTERNAL_DEGRADED_UNTIL_BOUND" });
  if (url.pathname === "/api/hybrid/status" && request.method === "GET") return json({ ok: true, state: "DEVICE_PROOF_REQUIRED", devices: [], jobs: [], nativeExecutionClaimed: false, message: "No verified native heartbeat is bound to this Cloudflare migration branch." });
  if (url.pathname === "/api/missions" && request.method === "GET") return json({ ok: true, missions: [], state: "DEVICE_PROOF_REQUIRED" });
  if (url.pathname === "/api/orchestrator/thread" && request.method === "GET") return json({ ok: true, thread: null, persistence: "LOCAL_BROWSER_UNTIL_CLOUD_STORE_BOUND" });
  if (url.pathname === "/api/orchestrator/turn" && request.method === "POST") {
    if (!env.OMEGA_MODEL_ENDPOINT) return json({ ok: false, code: "MODEL_PROVIDER_NOT_CONFIGURED", reply: "ENACT requires synthesis. No model provider is bound, so no command plan was fabricated or queued." }, 503);
    return json({ ok: false, code: "ORCHESTRATOR_ADAPTER_NOT_BOUND", reply: "The donor orchestrator UI is migrated, but its governed synthesis adapter is not yet bound." }, 503);
  }
  if ((url.pathname === "/api/hybrid/jobs" || url.pathname.startsWith("/api/hybrid/jobs/") || url.pathname === "/api/missions") && request.method === "POST") return json({ ok: false, code: "DEVICE_PROOF_REQUIRED", reply: "Native mission execution requires a verified paired-host heartbeat and proof channel." }, 503);
  if (url.pathname.startsWith("/api/missions/") && request.method === "POST") return json({ ok: false, code: "DEVICE_PROOF_REQUIRED", reply: "Mission control is unavailable until a verified paired host is bound." }, 503);

  if (url.pathname === "/api/route-preview" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const text = String(body.text || body.message || "").slice(0, 16384);
    return json({ ok: true, ...classify(text) });
  }

  if (url.pathname === "/api/chat" && request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const text = String(body.text || body.message || "").slice(0, 16384);
    const routing = classify(text);
    if (routing.route === "FAST_DETERMINISTIC") {
      if (/\brestoration\b/i.test(text)) return json({ ok: true, routing, reply: `Full-restore migration is ${RESTORATION.state} on ${RESTORATION.branch}. It is classified ${RESTORATION.lineageClassification}; merge requires build and inheritance PASS.` });
      if (/\bhealth\b/i.test(text)) return json({ ok: true, routing, reply: "Cloud Worker health is live. Full hosted-runtime restoration is still in progress. Native Hybrid Link requires verified device proof." });
      if (/\b(status|version|build status)\b/i.test(text)) return json({ ok: true, routing, reply: `${BUILD.product}; ${BUILD.publicAdapter}; restoration ${RESTORATION.state}; release authority B015 R1. The branch is not claimed as a full restore.` });
      return json({ ok: true, routing, reply: "Bounded deterministic route completed." });
    }
    if (!env.OMEGA_MODEL_ENDPOINT) return json({ ok: false, routing, code: "MODEL_PROVIDER_NOT_CONFIGURED", reply: "This request requires synthesis. The migration runtime will not fabricate a model response until a provider binding is configured." }, 503);
    const upstream = await fetch(env.OMEGA_MODEL_ENDPOINT, { method: "POST", headers: { "content-type": "application/json", ...(env.OMEGA_MODEL_AUTH ? { authorization: env.OMEGA_MODEL_AUTH } : {}) }, body: JSON.stringify({ text, route: routing.route }) });
    const payload = await upstream.text();
    return new Response(payload, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") || "application/json", "cache-control": "no-store" } });
  }
  return json({ ok: false, code: "NOT_FOUND" }, 404);
}

export { classify, RESTORATION };
export default { async fetch(request, env) { const url = new URL(request.url); if (url.pathname.startsWith("/api/")) return api(request, env, url); return env.ASSETS.fetch(request); } };
