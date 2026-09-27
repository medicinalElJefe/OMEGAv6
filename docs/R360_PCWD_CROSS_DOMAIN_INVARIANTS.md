# R360 · PCWD Cross-Domain Invariant Layer

R359 established a critical boundary: competent specialist methods already solve many of the underlying mathematical subproblems. PCWD generally **matches** them; it does not numerically dominate them.

R360 therefore stops asking whether raw domain numbers can be compared and asks a more precise question:

> Which parts of the proof-carrying transport contract are genuinely invariant across domains, and which parts are only locally meaningful?

## Structural invariants

R360 treats the following as cross-domain structural invariants:

- the seven-stage topology  
  `Sense → Normalize → Decompose → Lemma → Transport → Recover → Prove`;
- the eight promotion gates;
- gate-vector shape and promotion derivation;
- STAY / TURN / ESCALATE derivation from the gate vector;
- stage-chain / proof / packet / envelope integrity linkage;
- domain + version identity;
- explicit truth boundary.

These fields can be compared structurally across domains.

## Domain-local semantics

R360 explicitly excludes raw numerical comparison of:

- state representation;
- continuity;
- future plasticity;
- contradiction;
- burden;
- recovery error;
- dynamics error;
- observable error;
- path error;
- invariant error;
- evidence payload;
- scar payload;
- path payload;
- observables payload.

The reason is simple: the same field name can carry different semantics.

For example, a continuity scalar in the R349 woven field, a continuity policy scalar in a resolution lens, and the governance continuity scalar in the finite qubit adapter are **not the same physical or mathematical quantity** merely because they occupy the same kernel slot.

R360 therefore requires a **Domain Semantics Profile**.

## Domain Semantics Profile

Each domain declares:

- state space;
- transport meaning;
- recovery meaning;
- evidence meaning;
- scar meaning;
- path meaning;
- observable meaning;
- metric identities;
- units;
- scale;
- comparison rule;
- whether cross-domain comparison is permitted.

A metric is comparable only when both profiles explicitly declare the same:

1. semantic identity;
2. unit;
3. scale;
4. comparison rule;
5. cross-domain comparability permission.

Otherwise the result is:

`DOMAIN_SEMANTICS_DIFFER`

rather than an invented numerical comparison.

## Current proof

R360 proves the common structural contract across three materially different adapters:

1. R349 woven typed field;
2. recoverable micro/macro resolution lens;
3. standard-QM 2×2 unitary density-matrix adapter.

All three share:

- seven stages;
- eight gates;
- proof-envelope integrity;
- promotion derivation;
- decision derivation.

Their raw governance and error metrics remain intentionally non-comparable unless separately typed.

## Why this matters

This removes one of the biggest risks in a broad unified framework: **false universality**.

The stronger formulation is no longer:

> every domain has the same numbers.

It is:

> every admitted domain can participate in the same proof-carrying transport protocol while retaining its own mathematics, units, evidence rules, and failure semantics.

That is a much more defensible unification target.

## Advancement boundary

The next phase should build a typed **inter-domain bridge contract**.

A bridge must not merely say that domain A and domain B share a proof topology. It must declare which information is transported between them, which quantities are translated, which invariants must survive the translation, what error is introduced, and whether the translation is reversible.

That creates the next object:

[
oxed{
mathcal B_{Aightarrow B}
=
[
	ext{source profile},
	ext{target profile},
	ext{translation},
	ext{invariant map},
	ext{loss ledger},
	ext{recovery map},
	ext{proof receipt}
]
}
]

Only then should two different domains be allowed to claim an actual semantic bridge rather than merely structural similarity.
