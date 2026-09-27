# R361 · PCWD Typed Inter-Domain Bridge

R360 established that common proof structure does **not** make raw domain values semantically equivalent.

R361 adds the next object:

[
oxed{
mathcal B_{Aightarrow B}
=
[
P_A,
P_B,
T,
I,
Lambda_{mathrm{loss}},
R,
Pi_B
]
}
]

where:

- (P_A) is the source Domain Semantics Profile;
- (P_B) is the target Domain Semantics Profile;
- (T) is the declared translation;
- (I) is the invariant map;
- (Lambda_{mathrm{loss}}) is an explicit loss ledger;
- (R) is the recovery map;
- (Pi_B) is the bridge receipt.

## Bridge gates

A bridge is eligible only when all of the following hold:

1. source and target semantic profiles verify;
2. source and target profiles are distinct;
3. recovery error is bounded;
4. declared invariants survive;
5. every known loss is declared;
6. no unmodeled loss remains;
7. semantic authority is not silently transferred;
8. CanonState mutation is absent;
9. no new physical law is claimed.

This is stricter than simply showing that two objects can be encoded into the same data structure.

## First executable bridge

R361 implements:

[
	ext{2×2 complex density matrix}
ightarrow
	ext{8 real coefficients}
ightarrow
	ext{recoverable resolution lens}
ightarrow
	ext{8 real coefficients}
ightarrow
	ext{2×2 complex matrix}.
]

The resolution lens uses coarse representatives plus an explicit residual sidecar.

The bridge checks:

- maximum matrix coefficient recovery error;
- real trace preservation;
- imaginary trace preservation;
- profile integrity;
- loss declaration;
- authority non-transfer.

A successful receipt still states:

- `semanticEquivalenceClaimed = false`;
- `semanticAuthorityTransferred = false`;
- `physicalLawClaimed = false`;
- `canonicalMutation = false`.

The target vector-lens representation is therefore **not** promoted into a quantum state claim merely because the source matrix can be losslessly serialized through it.

## Loss ledger

The first bridge records three distinct facts:

### Numeric residual

The coarse representation alone is lossy. Exact recovery is possible only because the residual sidecar is retained.

### Semantic non-transfer

The real-valued lens coefficients are a representation of matrix coefficients. They do not independently acquire the meaning of a density matrix.

### Authority non-transfer

No physical, experimental, observational, CanonState, dispatch, or production authority transfers to the target representation.

## Negative control

R361 deliberately deletes the residual sidecar and reruns the same bridge.

The expected result is:

- nonzero recovery error;
- recovery gate failure;
- undeclared/unmodeled loss gate failure;
- bridge held.

This proves the bridge layer is not allowed to manufacture missing information.

## What R361 changes

Before R361, cross-domain PCWD could prove that domains shared a structural proof topology.

After R361, a specific cross-domain translation must carry its own:

- typed source/target profiles;
- translation meaning;
- recovery meaning;
- invariant receipts;
- explicit loss ledger;
- authority boundary;
- integrity receipt.

That is the difference between **structural similarity** and an **admissible semantic bridge**.

## Next boundary

The next phase should compose bridges.

For admissible

[
mathcal B_{A	o B}
quad	ext{and}quad
mathcal B_{B	o C},
]

we should determine whether

[
mathcal B_{B	o C}circmathcal B_{A	o B}
]

has bounded cumulative recovery error, preserved declared invariants, and a loss ledger that cannot erase losses from either component.

That would give PCWD a real bridge algebra instead of isolated translations.
