# OMEGA R127 — Evidence → Execution → Proof Fabric

R127 closes a major architectural gap: it connects source evidence, R126 causal analysis, the bounded R125/R126 swarm planner, externally returned execution receipts, independent verification, and R125 canonical admission without collapsing any of those stages into one another.

The governing chain is:

`SOURCE → PROVENANCE → CAUSAL COMPILE → BOUNDED PLAN → EXECUTION → RECEIPT → INDEPENDENT VERIFY → CANDIDATE → R125 ADMISSION`

Every arrow is an explicit boundary.

## Non-negotiable separations

`observation ≠ causal support ≠ plan ≠ execution ≠ execution quorum ≠ verified result ≠ CanonState`

R127 refuses the common failure modes that would make a large autonomous system look impressive while making it less accurate. A plan with 1,728 logical cells is not evidence that 1,728 cloud workers ran. A valid Merkle receipt is not evidence that the scientific interpretation is correct. Two agreeing models are not two independent measurements. A passing build is not empirical validation. A causal candidate is not CanonState.

## Address/execution hierarchy

`1 seed → 12 organs → 144 branches → 1,728 cells → 20,736 lanes`

This remains a software address and execution-resolution hierarchy. It is not a claim of literal physical dimensionality. Larger atlas/address capacities remain representation levels unless independently tied to a validated physical model.

## Stage 1 — Provenance

R127 delegates evidence validation to the R126 causal engine. Numeric evidence carries units, frame, time, provenance and uncertainty. Missing or invalid evidence blocks empirical promotion instead of being completed synthetically.

## Stage 2 — Causal compile

R126 classifies relations as `INSUFFICIENT`, `CORRELATED`, `SUPPORTED_CAUSAL`, or `CONTRADICTED`. R127 will not treat correlation or model-only prediction as causal support.

## Stage 3 — Bounded plan

R127 converts the objective and causal candidate into an R125 autonomic plan. The planner may address one cell, a branch, an organ, a partial body, or the full 1,728-cell logical body. Provider/model budgets remain bounded. Full automatic body use still requires explicit permission.

The plan is marked `PLANNED_NOT_EXECUTED` until an execution receipt exists.

## Stage 4/5 — Execution and receipt

R127 accepts an execution receipt only when its structure agrees with the requested plan. A `COMPLETE` receipt must account for every planned cell and must carry a valid Merkle root. Receipt provenance and timestamp are required. The receipt explicitly carries `canonicalMutation:false`.

No receipt produces `NOT_EXECUTED`. A malformed or inconsistent receipt produces `EXECUTION_UNPROVED`.

## Stage 6 — Independent verification

Candidate output can reach the R127 eligibility boundary only after at least two reproducible PASS receipts from at least two independent source families targeting the exact candidate hash, with no FAIL receipt in the admitted verification set.

This is deliberately stronger than execution quorum.

## Stage 7 — Candidate eligibility

R127 marks a candidate eligible only when all of these hold simultaneously:

1. no invalid source evidence;
2. at least one supported causal relation and no contradicted relation in the candidate graph;
3. at least 50% of supplied evidence is verified empirical/source-class evidence and at least one empirical item exists;
4. execution is proved complete against the bounded plan;
5. independent verification passes.

Eligibility is still not admission.

## Stage 8 — R125 admission

R127 never mutates CanonState. Canonical mutation remains external to R127 and governed by R125 accuracy/admission law or explicit human-governed promotion. This keeps the system capable of increasingly broad autonomous analysis and execution without granting broad autonomous truth-authority.

## Continuity and scar

R127 carries R126 scar/history forward and adds aggregate uncertainty burden. Negative results, contradicted relations and insufficient proof remain part of the state rather than disappearing during reconvergence.

The practical continuity law is:

`partition → observe → interact → preserve invariant evidence → carry residual/scar → re-contextualize → execute bounded work → independently verify → propose → admit/reject`

## Highest-potential interpretation

The maximum useful form of OMEGA is not a system that changes everything it can reach. It is a system that can route across a very large capability space while retaining exact boundaries around evidence, cost, execution, causality, uncertainty, history and authority.

R127 therefore expands capability while making the admission surface narrower and more explicit.
