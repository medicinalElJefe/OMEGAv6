# OMEGA R114 — Authenticated Federation Closure

## Objective

R114 converts the established federation topology into an auditable execution ceremony without changing the authority model.

Strict closure remains:

`operator intent → Genesis PROPOSE → Optical SCREEN → OMEGAv6 Tier-2 queue → Sovereign SOLVE → OMEGAv6 ADMIT → durable replay`

R114 does not call a node successful because a URL exists. Every transition needs a current receipt appropriate to that stage.

## Preserved authority

- **Genesis**: PROPOSE only. Node-local exploration cannot rewrite global CanonState.
- **Optical**: SCREEN only. It returns ranked optical packets / Tier-2 requests.
- **Sovereign**: SOLVE only. It polls an authenticated queue and returns full-wave result packets.
- **OMEGAv6**: ADMIT. It remains the single global proof/state authority.

Hybrid Link remains transport and authenticated machine continuity, not an authority node.

## Durable receipt chain

R114 stores bounded ceremony records in the existing `OMEGA_RUNTIME` Durable Object. Receipts form a predecessor chain:

1. `INTENT`
2. `PROPOSE`
3. `SCREEN`
4. `QUEUE`
5. `SOLVE`
6. `ADMIT`

Each receipt stores `previousReceiptSha256` and its own `receiptSha256`. The ledger endpoint returns the recent bounded chain for replay/audit.

## Strict service observation

A strict run begins at `POST /api/federation/ceremony/start`.

OMEGAv6 attempts:

- Genesis proposal through the `OMEGA_GENESIS` Cloudflare service binding using `/api/federation/propose` (or `OMEGA_GENESIS_PROPOSE_URL` when explicitly configured).
- Optical screening through `OMEGA_OPTICAL_SCREEN_URL` or the preferred Optical origin `/api/federation/screen`, using server-held Optical service/bypass tokens when configured.

If a remote endpoint is missing, invalid, unreachable or access-gated, the ceremony stops and records the dependency. No fallback packet is synthesized.

Only packets observed through those server-side calls carry `SERVICE_OBSERVED` trust. Manually supplied packets are `BRIDGE_ASSERTED`: useful for debugging, but insufficient for strict federation closure.

## Tier-2 contract repair

The prior public `OMEGA_FULLWAVE_QUEUE_v1` schema described `material_model` as a string while the live R34 queue gate and RCWA worker require numeric refractive indices.

R114 makes the public schema match the runtime:

```json
{
  "material_model": {
    "n_incident": 1.0,
    "n_feature": 2.4,
    "n_background": 1.0,
    "n_substrate": 1.46
  }
}
```

The material label may still exist in geometry/material provenance, but a label alone cannot satisfy the R3 RCWA material boundary.

## Sovereign queue gate

The ceremony does not queue a full-wave job unless:

- the bridge credential authenticates;
- a non-revoked RCWA worker has a current heartbeat;
- the Optical/Tier-2 job is `OMEGA_FULLWAVE_QUEUE_v1`;
- solver is currently `rcwa` for the closed R114 path;
- `source_packet_id` matches the screened packet;
- the inherited R34 Mode-188 / geometry / material / contradiction gate accepts the job.

R114 delegates queue admission to the inherited `/fullwave/queue` implementation rather than cloning or weakening it.

## Automatic return reconciliation

The R114 `OmegaRuntime` subclasses the complete R111 → R102 → R101 → R34 Durable Object lineage.

When the existing RCWA agent posts to `/api/federation/rcwa/result`, the inherited R34 result validator executes first. A valid return is then reconciled against the ceremony's exact queued job.

A strict run becomes `FULL_FEDERATION_PROVED` only when:

- Genesis receipt is `SERVICE_OBSERVED`;
- Optical receipt is `SERVICE_OBSERVED`;
- the current authenticated Sovereign worker returned the exact result lineage;
- the solver result is converged;
- OMEGAv6 emits the final ADMIT receipt.

Automatic ADMIT here means proof-ledger admission. It does not silently promote a computational result into experimental physical truth or fabrication validation.

## Bounded host proof

`POST /api/federation/ceremony/host-proof` provides a separate current-PC proof path.

It queues the same bounded RCWA fixture family already exercised by solver CI, but only after a current authenticated RCWA heartbeat exists. A returned result establishes:

`HOST_EXECUTION_PROVED_ONLY`

This proves that the user's current paired host actually claimed and executed a canonical RCWA queue job. It intentionally bypasses Genesis and Optical and therefore can never become `FULL_FEDERATION_PROVED`.

This separation is important because the immediate physical question—"is the current Sovereign host really executing?"—can be answered even while the protected Optical machine endpoint remains gated.

## Public API

- `GET /api/federation/ceremony/law`
- `GET /api/federation/ceremony/status`
- `GET /api/federation/ceremony/ledger`
- `POST /api/federation/ceremony/start`
- `POST /api/federation/ceremony/reconcile`
- `POST /api/federation/ceremony/host-proof`
- `POST /api/federation/ceremony/proposal` — manual/debug receipt
- `POST /api/federation/ceremony/screen` — manual/debug receipt
- `POST /api/federation/ceremony/queue` — manually advance an already-receipted debug run through inherited admission

## User surface

The existing Federation workspace remains the same R112 task-first living fabric. R114 adds one non-covering receipt surface beneath the living field:

- **Run strict federation**
- **Prove current PC with RCWA**
- **Reconcile**
- four visible PROPOSE / SCREEN / SOLVE / ADMIT stage states
- exact dependency/block code
- bounded hash-chain replay

The host-proof action exposes the existing Federation launcher when current RCWA proof is missing. It does not create a second launcher or second Hybrid credential system.

## Expected state immediately after deployment

Deployment can prove the new API, schema consistency, worker inheritance, UI build and truth gates. It cannot itself claim `FULL_FEDERATION_PROVED`.

With the present infrastructure state, likely strict-run outcomes are:

- Genesis may be LIVE but still require the new `/api/federation/propose` machine contract.
- Optical may remain `ACCESS_GATED` until protected server-to-server SCREEN access is configured.
- Sovereign may remain `CURRENT_RCWA_WORKER_REQUIRED` until the user's paired Windows federation/RCWA agents are currently heartbeating.

Those are useful results: the ceremony converts vague architecture gaps into exact, durable stage dependencies.

## Next expansion after a host proof

Once `HOST_EXECUTION_PROVED_ONLY` is observed from the current machine, the next ordered work is:

1. establish Genesis `OMEGA_PACKET_v1` proposal endpoint;
2. unlock authenticated Optical SCREEN endpoint and Tier-2 queue return;
3. perform one strict R114 ceremony through `FULL_FEDERATION_PROVED`;
4. extend the same receipt protocol to FDTD, then FEM/GPU capacity;
5. add physical measurement receipts as a separate evidence class rather than treating full-wave convergence as fabrication proof.
