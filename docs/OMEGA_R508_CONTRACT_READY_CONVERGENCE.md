# R508 · Contract-Ready Convergence

R508 refines the finite-convergence governor introduced by R507.

## Problem

R507 correctly made uncontracted convergence objectives fail closed during semantic acceptance. However, the scheduler still treated every self-editable unresolved item as eligible before generation.

That meant an objective could enter Workers AI, consume time, and only then discover that no acceptance contract existed. In the current matrix this overstated autonomous mutation potential by more than one hundred rows.

## Rule

Self-editable is not equivalent to mutation-ready.

For R388 work, autonomous mutation readiness now requires:

1. the item is unresolved;
2. the item is self-editable;
3. the item has an explicit item-specific acceptance contract;
4. the item is not held by returned decline evidence.

Unresolved self-editable items without an acceptance contract are classified as:

ACCEPTANCE_CONTRACT_REQUIRED

They remain visible as convergence debt but contribute zero autonomous mutation budget and are never sent to AI generation.

## Readiness partition

Each unresolved item belongs to one operational class:

- MUTATION_READY — explicit acceptance contract exists and no active hold prevents work;
- HELD_BY_RETURNED_EVIDENCE — contract-ready, but a returned decline/rejection scar blocks retry in the current evidence epoch;
- ACCEPTANCE_CONTRACT_REQUIRED — editable source exists, but completion criteria are not yet defined strongly enough for autonomous mutation;
- EXTERNAL_OR_GOVERNANCE_EVIDENCE — not honestly self-editable from product source;
- COMPLETE / ADVANCED — independently resolved.

Only MUTATION_READY contributes to the R507 finite mutation potential.

## Current observed consequence

After R507 truthfully reconciled R388-C-03 through exact-current-source proof, the next production cycle selected R388-D-02 even though D-02 had no acceptance contract, then terminated with AI_GENERATION_ERROR.

R508 removes that pre-generation waste. D-02 is contract debt until explicit proof criteria exist.

## Truth boundary

R508 does not mark contract debt complete. It does not synthesize scientific or external evidence. It does not grant autonomous authority to write governance merely because a contract is missing. It only prevents unqualified objectives from being mistaken for mutation-ready work.

R125 remains sole CanonState admission authority. ci.yml remains sole canonical production writer. R507 finite budgets and exact-head promotion remain in force.
