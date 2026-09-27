# Proof-Carrying Woven Dynamics v1

PCWD v1 turns the established OMEGA calculus into one executable state-transport formalism instead of another numbered feature layer.

## Canonical state packet

```
K_t = [
  A_t,
  x_t,
  P_G x_t,
  r_t,
  C_omega,
  Phi,
  q,
  Lambda,
  Sigma_t,
  Gamma_t,
  L_t,
  E_t,
  Pi_t
]
```

- `A_t` — 12^4 atlas address at the established 20,736 computational resolution.
- `x_t` — normalized local state.
- `P_G x_t` — declared symmetry-orbit representative.
- `r_t` — directional/local residual carried separately from the representative.
- `C_omega` — continuity.
- `Phi` — future plasticity.
- `q` — contradiction.
- `Lambda` — burden.
- `Sigma_t` — scar/history/path residual ledger.
- `Gamma_t` — active transport path.
- `L_t` — active lemma/equivalence certificate.
- `E_t` — evidence/admissibility packet.
- `Pi_t` — cryptographic proof receipt.

## Executable evolution

```
Sense
  -> Normalize
  -> Decompose
  -> Lemma
  -> Transport
  -> Recover
  -> Prove
```

The v1 lemma uses a declared Z2 atlas-complement action with orientation inversion. The representative is the orbit projection and the residual is retained as a proof sidecar:

```
x = P_G(x) + r
```

This intentionally separates compression/equivalence from information destruction. The current implementation requires bounded recovery before promotion.

## Promotion gate

A step is promotion-eligible only when all eight conditions are true:

1. continuity valid;
2. invariants preserved;
3. scar retained;
4. recovery bounded;
5. dynamics bounded;
6. observables bounded;
7. evidence admissible;
8. path recoverable.

The decision score is

```
S* = (C_omega * Phi)
     / (q + Lambda
        + alpha * epsilon_recovery
        + beta  * epsilon_dynamics
        + gamma * epsilon_observable
        + epsilon)
```

The score does not override failed proof gates.

- `STAY` — every promotion gate passed.
- `TURN` — transport remains admissible/recoverable but a bounded technical error gate failed.
- `ESCALATE` — a core continuity/invariant/evidence/recoverability gate failed.

## Path dependence / scar

PCWD computes a closed software transport loop using the established R349 operator:

```
source -> +orientation transport -> -orientation transport
```

The residual between the original invariant field and the closed-loop result is stored as a software holonomy/path-dependence measure. It is **not** claimed to be physical curvature.

## Temporal chain

`compileTemporalChainV1` creates a sequence of PCWD packets where every proof receipt binds the previous proof digest. This produces a recoverable proof chain across model time without creating another durable-history authority.

## Forecast branching

`compileForecastBranchesV1` evaluates negative / hold / positive transport branches from the same parent state. All branches remain explicit. Weights are declared model weights, not observational probabilities or election/physical forecasts.

## Authority and truth boundary

PCWD v1 does not introduce a new physical primitive and does not treat 12 -> 144 -> 1,728 -> 20,736 -> 248,832 as literal physical dimensions.

It does not replace:

- R125 CanonState admission;
- R141 exact returned proof;
- R146 durable execution history;
- R147 dispatch;
- governed production promotion.

Model history is not observed history. A proof receipt proves software-state properties under declared operators and tolerances; it does not by itself prove a scientific model or physical claim.

## Current executable binding

The first binding is the established R349 typed field because it already carries:

```
continuity
plasticity
burden
contradiction
scar
evidence
invariant
motion
support
orientation
```

PCWD therefore formalizes the state already present rather than inventing another state authority.

## Executable specializations now included

PCWD v1 also includes:

- sparse 12^n atlas addressing across 12 → 144 → 1,728 → 20,736 → 248,832 without materializing the whole address space;
- a recoverable micro/macro resolution lens that stores a coarse representative plus an explicit residual sidecar and measures reconstruction error;
- covariance transport under a declared Jacobian so uncertainty is carried rather than silently collapsed;
- composable lemma morphisms with domain/codomain checks, inverse recovery, invariant checks, identity and composition;
- an eight-phase Relational Skin Calculus receipt: Parent → Interaction → Scar → Continuity → Compression → Skin → Interpretation → Behavior;
- a finite 2×2 density-matrix unitary specialization using standard quantum mechanics with density validity, unitary validity, recovery error, transformed-observable preservation and qubit fidelity checks.

The quantum adapter is explicitly a specialization of the common transport/proof interface. It does not replace quantum mechanics or establish new physics.

## Further adapters

The kernel is deliberately adapter-oriented. Additional domains can bind only by declaring:

- state representation;
- admissible transforms;
- invariants;
- observable set;
- recovery map;
- error metric;
- evidence authority;
- truth boundary.

That is the required interface for micro/macro lenses, empirical domains, quantum density-channel experiments, Earth observation, and future solver/runtime integrations.


## Runtime convergence binding

`proofCarryingConvergenceBridge.ts` binds a PCWD packet to the inherited R356 Continuous Convergence Runtime. A bridge result can recommend `ADMIT` only when both conditions hold:

1. the PCWD packet passes its eight promotion gates and has a linked SHA-256 receipt;
2. inherited R356 relative-frame convergence and admission requirements independently pass.

The bridge is fail-closed. It has no CanonState mutation, dispatch, durable-history or production-write authority.

## Operational surface

The Convergence workspace now renders the full PCWD packet/gate/path receipt for the selected canonical address. Evidence & Proof renders a compact proof status. The surface exposes the seven-stage pipeline, eight promotion gates, error/holonomy receipt, RSC loop and bounded quantum specialization self-test while preserving the same truth boundary.


## One domain-neutral transport kernel

The phase boundary now includes `unifiedProofTransportKernel.ts`, which makes the seven-stage/eight-gate topology itself domain-neutral instead of duplicating proof logic per subsystem.

Every admitted domain supplies a contract for:

`Sense → Normalize → Decompose → Lemma → Transport → Recover → Measures`

The kernel then owns the common proof semantics:

- the same eight promotion gates;
- the same STAY / TURN / ESCALATE derivation;
- the same bounded error categories;
- SHA-256 fingerprints for every pre-proof stage;
- a SHA-256 proof receipt bound to the complete stage chain;
- previous-proof binding for temporal chains;
- semantic verification in addition to digest verification;
- tamper rejection;
- explicit domain and global truth boundaries.

The current executable adapters prove that the same kernel can govern both the established R349 woven typed field and a standard-quantum-mechanics 2×2 unitary density-matrix specialization without conflating their meanings or authorities.

This is the architectural point of PCWD: domains may have radically different state representations and mathematics, but they enter OMEGA through one proof-carrying transport contract rather than one-off promotion logic.
