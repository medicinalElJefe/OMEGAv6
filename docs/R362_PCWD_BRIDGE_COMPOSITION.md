# R362 · PCWD Bridge Composition

R361 proved one typed source→target semantic bridge with explicit recovery, invariant, loss and authority receipts.

R362 asks the next question:

\[
\boxed{
\mathcal B_{B\to C}\circ \mathcal B_{A\to B}
}
\]

Can two admissible bridges be composed without erasing component losses, inventing cross-domain error arithmetic, or transferring semantic authority?

## Composition rule

For

\[
A\xrightarrow{\mathcal B_1}B\xrightarrow{\mathcal B_2}C,
\]

R362 retains both component receipts and constructs a composition receipt containing:

- source, intermediate and target domain identities;
- both complete bridge receipts;
- an end-to-end recovery measurement back in the original source domain;
- source-domain invariant checks after the complete round trip;
- a cumulative loss ledger with the originating bridge and receipt digest for every entry;
- composition gates;
- a SHA-256 receipt digest.

## Error rule

R362 deliberately does **not** calculate

\[
\epsilon_{A\to B}+\epsilon_{B\to C}.
\]

Those errors may have different semantics and units.

Instead:

1. each component bridge must satisfy its own typed recovery tolerance;
2. the target representation is recovered through \(B\) and then through \(A\);
3. the final state is compared directly with the original \(A\)-domain source;
4. the measured result is gated using the source-domain recovery definition.

The receipt therefore declares:

\`crossDomainErrorAdditionPerformed = false\`

and

\`errorAggregation = SOURCE_DOMAIN_END_TO_END_MEASUREMENT\`.

A future analytic error-bound theorem may introduce typed amplification/Lipschitz declarations, but R362 does not invent such a bound.

## First composition

The executable chain is:

\[
\text{2×2 complex matrix}
\rightarrow
\text{recoverable resolution lens}
\rightarrow
\text{typed eight-real coefficient payload}.
\]

Recovery follows the inverse path:

\[
\text{8-real payload}
\rightarrow
\text{resolution lens}
\rightarrow
\text{2×2 complex matrix}.
\]

The intermediate profile digest must match exactly:

\[
P_{B,\text{target of }\mathcal B_1}
=
P_{B,\text{source of }\mathcal B_2}.
\]

A profile-chain mismatch is rejected before the second bridge executes.

## Monotone loss law

For component loss ledgers

\[
\Lambda_1,\Lambda_2,
\]

the composition ledger is

\[
\boxed{
\Lambda_{1\circ2}
=
\Lambda_1\uplus\Lambda_2
}
\]

with origin metadata.

The composition may add new loss entries, but it may not silently remove a component loss.

Every inherited entry remains bound to:

- its origin bridge ID;
- its component receipt digest;
- its original loss kind;
- declaration state;
- magnitude, when numerically meaningful;
- detail.

This is the first executable form of **scar/loss monotonicity across semantic bridges**.

## Negative control

R362 composes the R361 deleted-residual negative control with the valid second bridge.

The expected composition is held because:

- the first bridge is not eligible;
- an \`UNMODELED_LOSS\` exists;
- end-to-end source recovery is not bounded;
- the cumulative loss ledger preserves the failure instead of hiding it.

## Current boundary

R362 does not establish a universal mathematical category of all physical domains.

What it establishes internally is narrower:

> Typed PCWD bridge receipts can be composed while preserving component proof status, semantic-profile continuity, source-domain round-trip recovery, and a monotone loss ledger.

## Next phase

The next useful phase is not another arbitrary bridge. It is a **composition law benchmark**:

- identity bridge law;
- associativity of receipt composition where three compatible bridges exist;
- failure absorption: a held bridge must make the composed path held;
- loss monotonicity under three or more hops;
- cycle recovery \(A\to B\to A\);
- path comparison between two different admissible bridge routes connecting the same typed endpoints.

That would begin turning the bridge system into an actual algebra of proof-carrying translations.
