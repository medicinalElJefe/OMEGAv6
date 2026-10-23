# R684: source-complete, portable model session evidence

## Why this capability exists

R679 records executable source-mode, historical graph and donor-replay results in a local hash-linked session. It fingerprints its canonical eight input channels but a fingerprint **cannot reconstruct missing original bytes**. If an OMEGA release changes those channels, the older R679 JSON session can fail verification without any preservation of the original source input.

R684 adds a **separately downloadable source snapshot** so the same historical computation can be re-executed later, independently of the current runtime field.

## Exact source scope

The archive stores the complete arrays used by R679's recorded executable families, in fixed order:

`C`, `Phi`, `q`, `Lambda`, `scar`, `evidence`, `continuityGate`, `routeNext`.

Each channel has **20,736 entries**; each entry is encoded into little-endian binary Float32 (including integers of the 20,736 address lattice, exactly representable in Float32). Total deterministic input snapshot is **663,552 bytes**. The portable JSON contains an 884,736-character Base64 encoding of those bytes, a verbatim bounded R679 session and the enclosing SHA-256 integrity digest.

This is **not** a full copy of the OMEGA repository, all archives, all physical observations, the additional geometry/motion atlas, device data or the entire CanonState. Source completeness here means *the eight input channels required to replay these recorded executors*.

## Replay law

1. Before producing a portable export, verify R679 source fingerprint and rerun every recorded execution against the current source.
2. Serialize all eight source arrays in the fixed binary layout; calculate a SHA-256 over the complete canonical envelope.
3. On import, reject oversized or malformed envelopes and original-source bytes, then recompute the snapshot fingerprint, replay every recorded R671/R676/R678 action against the **archived** input, and recheck the original R679 event hash chain.
4. Independently compare the archive fingerprint with the present live source fingerprint when that source is available.
5. Distinguish outcomes:
   - `VERIFIED_LOCAL_REPLAY_AND_LIVE_SOURCE_MATCH`: archived executor inputs match the current runtime and all historical operations reproduce.
   - `VERIFIED_ARCHIVED_MODEL_REPLAY_ONLY`: archived operations reproduce, but the current source differs or is unavailable. **Never overwrite the live session or claim current CanonState admission.**
   - `HELD`: archive integrity, deterministic replay or source material is invalid; no historical proof admitted.
6. Restore a portable session into browser-local active recording only if a **fresh** import/source verification still matches the current source. The restored session itself remains local model evidence.

## Offline, network-free verification

The ZIP/source repository carries a standalone verifier; a user who exported a portable evidence bundle does not need ChatGPT or an active R2 account to replay it:

```bash
node scripts/verify-portable-session-r684.mjs omega-r684-portable-proof-2026-10-22.json
```

Requires Node.js 22 or later and the OMEGA source checkout containing the original R671/R676/R678 executors. It outputs a JSON receipt and exits **0 only if** the eight-channel archived source digest, full session hash chain and every original model computation pass. Invalid or edited evidence exits **1**. The CLI intentionally reports `liveSourceAttested=false` because a downloaded artifact alone cannot establish the current production state or owner authenticity.

## Tamper and authenticity boundary

The exported archive's SHA-256 protects against accidental editing, truncation, corrupted records and tampering **without updating the digest**. It is *not a digital signature or an immutable cloud witness*. Anyone who controls the source archive and all its digests can fabricate and rehash a new self-consistent model record. Such a self-consistent file is at most a reproducible model artifact, not evidence that a particular original provider, device or production executor generated it.

No owner credential, ChatGPT library bytes or private R2 token is included. Do not claim external authentication, cloud replication, measured physical dimensions, native host proof, R125 CanonState admission, R141 exact-return proof or R146 durable history from this bundle.

## Production acceptance

- `tests/r684-portable-session-bundle.mjs`: deterministic binary round trip, all eight arrays, three existing execution families, historical source drift, tampering, malformed values and source nonmutation.
- `tests/r679-canonical-session-browser-e2e.mjs`: actual desktop/mobile R679 recording and the new portable download/import/alteration/restoration behavior.
- CI runs both source and browser tests. Production `deploy-main` additionally runs the browser check against the exact promoted SHA **before** R223 post-deploy closure can mark the change accepted.

Private cloud archive from R683.1 remains independently held by Cloudflare R2 account activation. Portable download/export does not turn the pending R2 buckets into functioning persistent storage.
