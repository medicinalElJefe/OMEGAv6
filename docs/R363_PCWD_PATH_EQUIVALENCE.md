# R363 · PCWD Path Equivalence and Semantic Scar

R362 proved that typed bridge receipts compose while carrying losses monotonically.

R363 now compares **two different admissible paths connecting the same typed endpoints**.

## Paths

Direct:

\[
A \xrightarrow{\mathcal B_D} C
\]

Indirect:

\[
A \xrightarrow{\mathcal B_1} B \xrightarrow{\mathcal B_2} C.
\]

The current executable case is:

- \(A\): standard-QM 2×2 complex coefficient representation;
- \(B\): recoverable resolution lens;
- \(C\): ordered eight-real coefficient payload.

The direct path flattens the matrix coefficients directly.

The indirect path passes the same coefficients through the recoverable coarse+residual lens before producing the same typed coefficient payload.

## What R363 measures

The receipt separately tests:

1. source semantic profile equality;
2. target semantic profile equality;
3. direct-path admissibility;
4. indirect-path admissibility;
5. endpoint numerical equivalence;
6. source-domain round-trip equivalence;
7. proof-receipt path distinction;
8. loss-ledger distinction.

The important distinction is:

\[
\boxed{
\text{same endpoint}
\not\Rightarrow
\text{same path receipt}
}
\]

and

\[
\boxed{
\text{zero numerical loop error}
\not\Rightarrow
\text{no retained semantic scar}.
}
\]

## Numerical holonomy boundary

For the current path pair, R363 measures the recovered source states directly.

If

\[
\|\hat x_D-\hat x_I\|\le \varepsilon,
\]

then the numerical loop is called **flat for this declared representation test**.

The receipt still retains distinct path/proof/loss history.

R363 explicitly sets:

- \`physicalHolonomyClaimed = false\`;
- \`semanticEquivalenceClaimed = false\`.

The word “holonomy” here is not promoted into a new physical observable. The executable claim is only about path-dependent software/semantic receipts.

## Why the semantic scar differs

The direct path carries:

- semantic non-transfer;
- authority non-transfer.

The via-lens path additionally carries the lens residual fact and another semantic boundary.

Even when the residual magnitude is zero for an exactly recovered sample, the intermediate representation step remains part of the path history.

Thus the endpoint packet can be numerically identical while the provenance/loss ledger remains distinguishable.

## Relationship to established methods

Event sourcing, provenance systems, workflow logs, and hash-linked ledgers can also preserve path/history.

R363 does not claim otherwise.

The PCWD question is narrower:

> Can the same typed transport system preserve endpoint equivalence, source recovery, semantic-profile continuity, proof integrity, and path-specific loss receipts in one composable contract?

## Next boundary

The next mathematically useful step is to benchmark path laws rather than add vocabulary:

- direct vs indirect path equivalence over randomized admissible states;
- non-flat numerical loops;
- loss-ledger partial ordering;
- cycle \(A\to B\to A\);
- alternative-path selection under cost/recovery constraints;
- identity and failure-absorption laws.

Those tests should determine whether the bridge algebra deserves stronger formal language.
