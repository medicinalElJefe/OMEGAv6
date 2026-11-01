# Dewey V9 — Exact Time / Rotation / Return Research

## Mathematically certified, limited scope

This is a research-only laboratory over 2D integer-linear discrete-time maps, with quarter-turn generator R = [[0,-1],[1,0]]. It does not make statements about physical time or all physical dimensions.

For T a 2x2 integer matrix, x an integer state, t a nonnegative integer, and q any integer:

- K(t,q,x) = || T^t R^q x - R^q T^t x ||²
- H(t,q,x) = || T^t x - R^q x ||²

Both are exact nonnegative integers. Zero K at a specified state only proves the two paths agree for that state. Global equivariance of T holds iff TR=RT as matrices; for T=[[a,b],[c,d]], this is equivalent to a=d and c=-b. If TR=RT, all powers commute for every state, t, q.

The six executable exact models are uniform scaling, anisotropic scaling, rotational evolution, shear, projection and reflection. Uniform scaling and rotational evolution commute with R globally; the other four do not. This statement is restricted to the listed maps.

The rotational evolution T=R at x=(1,2) has H(1,1,x)=0 but H(1,0,x)=10, distinguishing a return up to rotation from an ordinary state return. After four steps T^4=I.

## Repeated observation versus genuinely new information

For integer candidate states in [-2,2]², measuring x=1 leaves five possibilities. The rotated x measurement (Rx)_x=-2 reduces the set to (1,2) uniquely. Repeating x=1 adds no exclusion. Rotationally invariant observations h(x,y)=x²+y²=5 leave eight possible states even after two rotations.

For evolution with observation, the appropriate set update is F(t+1)=T(F(t)) ∩ h_q^{-1}(O(t+1)) ∩ C, subject to known observation/time hypotheses. The examples test repeated observation of the same unknown state.

Noninvertible maps cannot be made invertible by a saved event history: a history may record a known path, but a projected output cannot recover an unrecorded input.

## Existing OMEGA integration boundary

- New engine: src/proof/deweyTemporalRotationV9.js, BigInt exact operators; no host actions, routes, or state mutation.
- Proof carry bridge: src/proof/deweyTemporalProofBridgeV9.js, compiles existing R292 certificate-completeness packets and R293 unresolved research cells.
- Regression: node tests/dewey-temporal-rotation-v9-invariants.mjs.
- No new parallel truth, CI, promotion, deployment, or CanonState authority. R294/R295 remain unchanged and retain their existing evidence and source-admission obligations.
- Source-carry explicitly declares the local V8 CSV un-ingested, so the V8 source remains an R292 missing-source scar until source identity and digest are durably verified.
- No live Auto-Ping scheduler is activated; repeated checks with identical evidence do not change claim status.

## 20,736-address reconciliation

The external V8 study dataset contains 20,736 symbolic number-theory fourfold-collision strata. A separate local V9 dataset maps those IDs to the same numeric address and evaluates six independent dynamical models per address: 124,416 exact instance rows. The mapping is an audit index, not a statement that binomial row gaps are time/rotation variables or that physical reality has 20,736 dimensions. Existing corpusRuntime semantics are conserved.

The local package additionally contains a 78-event SHA-256 predecessor-linked temporal ledger and 360 independently computed Python-vs-JavaScript integer fixture comparisons. The CSV and generator bytes are not in this PR; therefore this PR does not claim live production import or independent remote replay of those CSV bytes.

## Claims held

- Singmaster G09/G10/G13 remain OPEN.
- No global nonlinear/higher-dimensional/continuous-time classification established.
- No physical universal law, empirical inference, source recovery, OMEGA7 route acceptance, or production deployment established.
- Exact mathematical model checks are not generalized beyond their hypotheses.

Acceptance boundary: research-only source and tests. Full-product production claims require canonical workflows, exact-head tests, live SHA proof, historical parity evidence, and existing governed admission.
