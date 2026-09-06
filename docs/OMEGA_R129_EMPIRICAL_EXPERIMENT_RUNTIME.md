# OMEGA R129 — Empirical Experiment Runtime

R129 makes the R128 calibration/replay layer operational as a reproducible command-line experiment runner. It consumes an explicit JSON experiment packet and emits a deterministic artifact set rather than leaving empirical validation as an in-memory library call.

## Invocation

```bash
node --experimental-strip-types scripts/r129-empirical-experiment.mjs \
  --input experiment.json \
  --out artifacts/my-experiment \
  --verify-replay
```

## Outputs

Every successful run produces:

- `experiment.normalized.json` — deterministic normalized experiment input;
- `validation.receipt.json` — R128 VALIDATED / NOT_VALIDATED / INCONCLUSIVE evidence result;
- `replay.capsule.json` — semantic replay identity and dataset hashes;
- `ledger.json` — R129 experiment identity, status, authority and truth boundaries;
- `manifest.json` — file-level SHA-256 hashes and byte counts.

## Replay verification

`--verify-replay` rereads the normalized experiment and recomputes its R128 semantic hash. The command fails if semantic identity changes or if any emitted artifact differs from its manifest hash.

Wall-clock metadata remains excluded from semantic experiment identity by R128 law, while semantic evidence values, labels, scores, dataset identity, policy, claim, model ID and upstream proof hashes remain hash-bound.

## Authority

R129 produces an experiment ledger, not CanonState. The ledger carries:

- `canonicalMutation:false`;
- synthetic external-validation credit = `0`;
- validation scoped to declared dataset and policy;
- replay explicitly separated from execution;
- admission authority = R125.

The full current evidence path is therefore:

`source evidence → R126 causal candidate → R127 execution/proof candidate → R128 empirical calibration/replay evidence → R129 reproducible experiment artifact ledger → R125 governed admission`

R129 is intended to be the practical bridge for external benchmark datasets and reproduction packets. It does not download data implicitly, invent ground truth, or promote an internally generated fixture into external evidence.
