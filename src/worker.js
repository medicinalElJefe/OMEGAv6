const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

const BUILD = Object.freeze({
  product: "OMEGAv6 Sovereign Cloud Runtime",
  deploymentLineage: "OMEGA B015 sovereign chain + hosted B058/V90 donor merge",
  acceptedDescendant: "R7 contextual continuity",
  publicAdapter: "R10 restored workstation shell",
  releaseAuthority: "Google Drive LATEST_OMEGA_UPDATE.json",
  deployBridge: "GitHub -> Cloudflare Workers",
  hostedRestoration: "44-menu workstation shell restored; provider/native/external adapters remain truth-gated",
  appDeploy: false,
  generatedAt: "2026-08-28"
});

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: JSON_HEADERS });
}

function isBoundedRuntimeQuery(text) {
  const t = String(text || "").trim();
  return /^(?:status|health|version|build status|runtime status|provider status|bridge status|hybrid link status|heartbeat status)\??$/i.test(t)
    || /^(?:what(?:'s| is)|show|check|get)\s+(?:the\s+)?(?:status|health|version|build status|runtime status|provider status|bridge status|hybrid link status|heartbeat status)\??$/i.test(t);
}

function classify(text) {
  const t = String(text || "").trim();
  if (!t) return { route: "FAST_DETERMINISTIC", reason: "empty-input", modelInvocations: 0 };
  if (/\b(all modes|full modes|activate all modes)\b/i.test(t)) return { route: "ROUTED_MODEL_FULL", reason: "explicit-all-modes", modelInvocations: 0 };
  if (isBoundedRuntimeQuery(t)) return { route: "FAST_DETERMINISTIC", reason: "bounded-runtime-query", modelInvocations: 0 };
  if (/\b(repair|design|forecast|train|compare|analy[sz]e|deep|full|build|code|program|create|make|implement|upgrade|fix)\b/i.test(t)) return { route: "ROUTED_MODEL", reason: "synthesis-required", modelInvocations: 0 };
  return { route: "ROUTED_MODEL", reason: "conversational-synthesis", modelInvocations: 0 };
}

async function api(request, env, url) {
  if (url.pathname === "/api/health" && request.method === "GET") {
    return json({ ok: true, service: BUILD.product, build: BUILD, now: new Date().toISOString() });
  }

  if (url.pathname === "/api/status" && request.method === "GET") {
    return json({
      ok: true,
      build: BUILD,
      cloud: { worker: "LIVE", staticAssets: "LIVE", workstationShell: "RESTORED_R10", menuContract: "44/44" },
      canonicalAuthority: { source: "Google Drive", state: "EXTERNAL_AUTHORITY", promotion: "POINTER_CONTROLLED" },
      modelProvider: env.OMEGA_MODEL_ENDPOINT ? "CONFIGURED_EXTERNAL" : "NOT_CONFIGURED",
      hybridLink: { state: "DEVICE_PROOF_REQUIRED", missionControlSurface: "RESTORED", nativeExecutionClaimed: false },
      earth: { state: "RESTORED_UI", liveFeeds: "EXTERNAL_DEGRADED_UNTIL_BOUND" },
      restoration: {
        shell: "LIVE",
        menus: 44,
        routeDiscipline: "PRESERVED",
        localContinuity: "LIVE",
        stateTraversalProjection: "LIVE",
        nativeHostAdapter: "DEVICE_PROOF_REQUIRED",
        externalModelAdapter: env.OMEGA_MODEL_ENDPOINT ? "CONFIGURED_EXTERNAL" : "NOT_CONFIGURED"
      },
      truthBoundary: "Cloud restoration does not supersede Drive release authority or claim native/device/provider/live-feed capability without evidence."
    });
  }

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
      if (/\bhealth\b/i.test(text)) return json({ ok: true, routing, reply: "Cloud runtime and restored 44-menu workstation shell are live. Native Hybrid Link still requires a verified device heartbeat." });
      if (/\b(status|version|build status)\b/i.test(text)) return json({ ok: true, routing, reply: `${BUILD.product}; ${BUILD.publicAdapter}; deployment lineage ${BUILD.deploymentLineage}. Canonical promotion remains controlled by Google Drive.` });
      return json({ ok: true, routing, reply: "Bounded deterministic route completed." });
    }

    if (!env.OMEGA_MODEL_ENDPOINT) {
      return json({
        ok: false,
        routing,
        code: "MODEL_PROVIDER_NOT_CONFIGURED",
        reply: "This request requires synthesis. The restored workstation will not fabricate a model response until a provider binding is configured."
      }, 503);
    }

    const upstream = await fetch(env.OMEGA_MODEL_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", ...(env.OMEGA_MODEL_AUTH ? { authorization: env.OMEGA_MODEL_AUTH } : {}) },
      body: JSON.stringify({ text, route: routing.route })
    });
    const payload = await upstream.text();
    return new Response(payload, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") || "application/json", "cache-control": "no-store" } });
  }

  return json({ ok: false, code: "NOT_FOUND" }, 404);
}

export { classify };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return api(request, env, url);
    return env.ASSETS.fetch(request);
  }
};
