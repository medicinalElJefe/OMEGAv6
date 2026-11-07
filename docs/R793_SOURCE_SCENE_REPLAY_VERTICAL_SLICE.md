# R793 — One field → scene → proof → replay (staged integration)

## Source inheritance (no replacement architecture)
The current OMEGA7 Atlas/Visual route already owns a real 20,736-address `mandala20736Runtime` field. R734 renders native source channels, R770 combines two independently normalized channels, R769 makes triangles and directed successor lines, and `SourceTessellationR769` exposes that field through the existing interface.

R793 adds one **portable source-scene artifact** and an **import/recompute verification** to that same instrument. It does not create a second scene engine or take Canon/HostState authority.

`getMandala20736Field → R734/R770 raster → R769 tile → R793 scene bundle → JSON with SVG + source hashes → import against current field → strict replay check`.

The scene artifact contains:
- Complete source channel fingerprint over 22 declared typed-array channels and the full 20,736 addresses. Float32 components use explicit little-endian encoding; successor and domain channels have range checks.
- Separate hashes of the chosen source raster values, actual RGBA rendering bytes, and portable SVG bytes.
- Selected address, tile size, edge visibility, geometry counts and an integrity fingerprint over the complete structured manifest.
- An R125 Canon-admission disclaimer, no-device-proof disclaimer, and explicit source-derived/representational geometry authority.

The exported JSON is **not an authenticated receipt**. SHA-256 plus local recomputation detects local mutation and mismatched source; it does not establish that an external observer witnessed the work. Imported saved scenes must match the presently compiled source and selected raster or return REFUSED. Every user-facing control performs actual file export or local replay validation; no action mutates CanonState or the connected host.

## Inherited and new tests
`npm run test:r793` validates 20,736-address coverage, constant channel domain/successor shape, deterministic repeat, woven lens, changed-source refusal, malformed input, geometry counts, and import/export UI wiring. It is prepended to the inherited `npm run check` chain, not substituted for any legacy checks. Exact-head browser and release tests remain mandatory.

## Historical original versus current successor
The recovered `OMEGA_FULL_SYSTEM_FUNCTIONAL_FORMULATION_v1.docx` and `OMEGA_UNIVERSAL_INTRINSIC_RENDER_MACHINE_FULL_LEDGER.md` describe a broader native Atlas-as-renderer, one launcher, pressure/membrane dynamics and arbitrary seed pipeline. Their recorded local tests and donors are historical provenance, not present production attestations or an invitation to overwrite R48 current successors. Current R793 only proves the live source-field-to-portable-scene vertical slice. It **does not** claim full arbitrary input `render_anything`, native GPU/Windows installer, full historical donor parity, continuous audio/material simulation or a user-visible accepted production release.

Archive and donor disposition remains KEEP current successors; fingerprint donors before MERGE; retain DONOR candidates and QUARANTINE conflicts without replacing current authority.

## Staging gates
1. PR exact-head `test:r793`, inherited `npm run check`, browser/route/mobile, build, and worker dry-run gates.
2. Governed merge only if required checks pass with no regressions.
3. Exact-SHA Worker staged verification → 100% promotion → live behavioral proof → R223 closure and rollback eligibility.
4. Native and historical claims **remain held** until first-hand physical-host receipts or donor-byte/fidelity proof exist.

The retained user-facing truth boundary should remain visible in every stage.
