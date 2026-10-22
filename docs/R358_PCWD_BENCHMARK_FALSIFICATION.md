# R358 · PCWD Benchmark & Falsification Boundary

R358 is the first phase after the R357 Proof-Carrying Woven Dynamics merge whose purpose is **not** to add another conceptual layer. Its purpose is to try to break PCWD with explicit benchmark problems, expose costs, and record what information a simpler baseline discards.

The benchmark suite lives in:

- `src/system/pcwdBenchmarkSuite.ts`
- `src/system/pcwdBenchmarkGovernor.ts`
- `tests/r358-pcwd-benchmark-suite.mts`
- `tests/r358-pcwd-benchmark-governor.mts`

## Benchmark rule

Each case declares an explicit baseline. The suite does **not** use “conventional methods” as a vague comparison class.

A result is only interpreted relative to the named baseline in that row.

The benchmark boundary is:

> Internal success does not prove novelty, scientific validity, or superiority over methods that were not explicitly implemented and compared.

## Cases

| ID | Classical problem | Explicit baseline | What is measured |
|---|---|---|---|
| RECOVERABLE_RESOLUTION_LENS | lossy coarse-graining / round-trip reconstruction | coarse block means only | RMSE, retained residual energy, storage overhead |
| CLOSED_PATH_HISTORY | path dependence with identical endpoint | final state only | endpoint collision vs path/proof distinguishability |
| PACKET_TAMPER | integrity after state mutation | unsealed object acceptance | mutation detection |
| EVIDENCE_ADMISSIBILITY | numerically valid state with missing evidence | numeric-only acceptance | whether missing evidence blocks promotion |
| QUBIT_UNITARY_VALIDITY | 2×2 density-matrix unitary round trip | unchecked matrix transform | unitary/density validity, recovery, observable error, fidelity |
| COVARIANCE_CARRY | correlated linear covariance propagation | diagonal variance only | Frobenius error from discarded cross-covariance |
| FORECAST_BRANCH_RETENTION | multi-hypothesis future retention | single argmax branch | branch count and discarded branch weight |
| LORENZ63_DYNAMICS_CORRESPONDENCE | Lorenz-63 one-step dynamics correspondence | unchecked next-state acceptance | declared dynamics residual and gate response |
| NO_RESIDUAL_NEGATIVE_CONTROL | recovery after real information deletion | lossy block mean without residual | reconstruction failure and fail-closed behavior |
| PROOF_OVERHEAD | trivial identity state | state only | serialized representation overhead |

## What counts as a success

R358 deliberately separates several outcome classes.

### WIN

PCWD demonstrates a measurable property that the exact baseline does not retain or check.

Examples:

- exact recovery because the residual sidecar is explicitly retained;
- path identity despite endpoint collision;
- tamper-evident packet/proof binding;
- evidence admissibility as a separate gate;
- preservation of cross-covariance;
- retention of non-argmax future branches.

### COST

PCWD is worse on a measured resource axis.

The first required cost benchmark is representation overhead. A trivial state-only baseline is necessarily smaller than a seven-stage proof packet with receipts and integrity seals.

R358 treats that as evidence, not as an inconvenience to hide.

### LIMIT

PCWD cannot produce information that was actually destroyed.

The negative-control adapter performs lossy block averaging **without retaining the residual**. Recovery must fail. PCWD passes this benchmark only by detecting the failure and refusing promotion.

That distinction is central:

[
	ext{proof of recoverability} 
eq 	ext{manufacture of missing information}.
]

## Lorenz-63 interpretation

Lorenz-63 is used as a classical nonlinear dynamics correspondence test. The suite computes a declared RK4 one-step reference at the standard parameter set

[
sigma=10,qquad ho=28,qquad eta=rac83.
]

PCWD does not claim to improve RK4, solve chaos, or extend forecast horizons. It checks whether a candidate state corresponds to the declared reference within tolerance and exposes the residual when it does not.

The benchmark therefore tests **proof-governed model correspondence**, not new dynamics.

## Quantum interpretation

The 2×2 unitary benchmark uses ordinary density-matrix quantum mechanics. A valid unitary case should pass; an intentionally non-unitary matrix should fail the invariant gate.

This tests whether the same domain-neutral PCWD proof topology can wrap a mathematically different domain without changing the meaning of that domain.

It is not evidence of new quantum physics.

## Falsification governor

The R358 benchmark governor will not recommend advancement merely because the suite has wins.

Its default policy requires:

- at least 10 classified cases;
- at least 6 explicit-baseline wins;
- at least one measured cost;
- at least one measured limit / negative control;
- every PCWD case to exhibit its expected behavior;
- at least 8 distinct information-loss categories measured;
- no unclassified result.

A success-only or cherry-picked report therefore fails closed.

The governor has no CanonState or production authority. Its receipt is benchmark evidence only.

## Information-delta ledger

Across the cases, R358 explicitly measures whether the baseline discards:

- within-bin residual;
- high-frequency / impulse detail;
- route or order history;
- mutation evidence;
- evidence provenance / admissibility;
- validity proof for a supplied transform;
- cross-covariance;
- non-argmax admissible futures;
- discarded branch weight;
- model-correspondence error.

This is a more useful question than “is PCWD better?” because it is falsifiable:

> **Which exact information survives, which exact information disappears, and what does retaining it cost?**

## Advancement rule

R358 is allowed to advance only after the exact PR head passes the canonical application check and the full benchmark/governor suite.

The next phase should then use the measured failures and costs to improve PCWD, not merely add more benchmark wins.


## Benchmark-guided continuation: proof-index compaction

The first measured cost is full-envelope representation overhead on a trivial state. R358 does not hide or reclassify that cost.

Instead, the unified kernel now exposes a compact content-addressed proof index containing:

- domain and address;
- decision and promotion status;
- eight gates packed into a bit mask;
- error and tolerance vectors;
- previous-proof digest;
- stage-chain digest;
- proof digest;
- packet digest;
- envelope digest.

The compact index is a projection, not a replacement for the complete packet. It explicitly declares:

`requiresFullEnvelopeForSemanticVerification = true`.

Verification therefore remains:

[
	ext{compact index}
longleftrightarrow
	ext{complete sealed envelope}
longleftrightarrow
	ext{stage/proof semantics}.
]

R358 requires the compact index to be less than half the serialized size of the full proof envelope in the trivial-overhead benchmark. The state-only baseline is still expected to remain smaller; compaction reduces a real cost rather than pretending the cost disappeared.


## Measured R358 CI result

The exact R358 benchmark code passed the canonical application check on the PR head after the compact-index continuation. The measured suite result was:

- **10 total cases**
- **8 explicit-baseline wins**
- **0 ties**
- **1 measured cost**
- **1 measured limit**
- **10 / 10 expected PCWD behaviors**
- **11 named information-loss categories**

Measured values:

| Case | PCWD | Explicit baseline / negative control |
|---|---:|---:|
| Recoverable resolution lens | mean RMSE **0** | coarse-only mean RMSE **1.4408828033** |
| Resolution storage | 326 serialized bytes with residual | 129 bytes coarse-only; **2.5271×** storage ratio |
| Closed path | same endpoint, path identity retained | same endpoint, route/order lost |
| Packet mutation | mutated envelope rejected | unsealed baseline has no mutation check |
| Missing evidence | **ESCALATE**, promotion blocked | numeric-only state remains numerically acceptable |
| Valid qubit unitary | recovery error **3.33×10^-16**, fidelity **0.9999999999999997** | unchecked transform has no validity proof |
| Correlated covariance | cross-covariance retained | diagonal-only Frobenius error **2.1213203436** |
| Forecast branching | **3** branches retained | argmax retains **1**, discarding **0.5** model weight |
| Lorenz-63 reference | exact candidate residual **0** | perturbed candidate residual **0.0327871926** |
| Missing residual negative control | promotion held; recovery error **1.5811388301** | discarded information cannot be reconstructed |
| Full proof envelope overhead | **4,937 bytes** | state-only baseline **15 bytes** |
| Compact proof index continuation | **1,025 bytes**, verified | **0.207616×** the full PCWD envelope |

The compact index therefore materially reduces the measured proof-index footprint, but it does **not** erase the underlying cost: even the compact index remains much larger than the trivial 15-byte state-only baseline and requires the full envelope for semantic verification.

The useful result is not “PCWD wins everything.” The measured result is more specific:

1. PCWD retained information that each named minimal baseline intentionally discarded.
2. PCWD correctly refused recovery when the residual was actually destroyed.
3. PCWD imposed substantial proof/storage overhead.
4. The first benchmark-guided continuation reduced index/wire proof overhead while keeping the full semantic envelope recoverable by content address.
