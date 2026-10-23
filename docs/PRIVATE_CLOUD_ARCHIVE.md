# Private cloud file archive

OMEGA 7 and OMEGA 6 share the **Private cloud files** viewer at Archive Census / Archive Operators. The archive holds original file bytes in private R2 storage independently of ChatGPT attachment links. Neither catalog entries nor successful software builds prove that any file has been transferred.

## Storage and access

- Primary: `omegav6-private-archive`; backup: `omegav6-private-archive-backup`.
- Both buckets remain private, without public object domains or deletion lifecycles. They are separate copies within the same Cloudflare account, not an off-provider disaster backup.
- A random owner access key is supplied to the owner separately. Only its SHA-256 verifier is in configuration. Never put the access key, source inventory, original files, or transfer receipts in the source repository.
- All file and catalog endpoints require authentication. Browser login creates a Secure, HttpOnly, SameSite=Strict cookie lasting 12 hours. The transfer client uses a bearer credential. Cross-origin requests are denied.
- Content-addressed chunks are 8 MiB maximum. Each PUT checks actual length and SHA-256; both copies must contain every chunk before a file record commits. Retries reuse identical chunks and records. There is no deletion endpoint.
- Downloads stream original chunks and support single HTTP byte ranges. HTML, SVG and executable payloads download as attachments; the viewer never executes or extracts historical packages.
- CanonState admission, donor evaluation, execution authorities and existing production gates are unchanged. Archive data is user material, not automatically admitted scientific or executable authority.

## Deployment

The existing `ci.yml` production job remains the only production-write workflow. After its existing exact-main and local browser proofs, `staged-cloudflare-release.sh` invokes `scripts/provision-private-archive.mjs` to find/create the two named buckets using existing production credentials, then runs the existing staged deployment and live proof sequence. Missing R2 permission is a deployment blocker, never a reason to weaken a gate. No Cloudflare account/token is included in the source.

## Transfer and proof

Materialize original files using the source provider's supported export. Keep source identifiers, version identifiers, original paths and filenames. Use a distinct local root for sources that share a path; never overwrite an earlier source just because its filename matches.

Run `scripts/archive-transfer.py --base <canonical-https-origin> --token-file <owner-key-file> --inventory <page.json> --root <materialized-root> --receipts <private-proof.jsonl>`.

The inventory page has `items`, with each original listing row carrying `kind`, `name`, `path`, `size_bytes`, `mime_type`, `library_file_id`, `file_id` and optional `version_id`. The client checks source size, computes full-file SHA-256, uploads missing chunks to both buckets, commits the immutable source record, then independently downloads both complete copies and checks original byte count plus full SHA-256. Only then does it append `BOTH_REPLICAS_READBACK_VERIFIED` with both readback results to its local proof ledger. Keep that ledger outside the repository.

A file record's `CHUNK_SHA256_VERIFIED` state is weaker than full client roundtrip proof. Do not report completion until every source is matched to a successful readback receipt. Keep missing, failed and inaccessible sources explicitly unresolved.

## Coverage baseline

The first complete native file listing for this task contained **6,647 files totaling 35,200,912,543 bytes**, plus six folder entries. It did not recursively list the mounted Google Drive provider and does not establish coverage of conversation transcripts or attachments absent from that source listing. Those require their own source inventories/exports. This count is a source snapshot, not an upload count.

## Validation

`npm run test:private-archive` runs actual local Workers/R2 execution using Miniflare. It tests anonymous non-disclosure, cross-origin rejection, secure login cookies, checksum rejection, missing-backup commit refusal, resumable repair, immutable records, primary/backup readback, cross-chunk/suffix/invalid byte ranges and denied deletion. It is included in `check:static`. Production and browser evidence remain separate requirements.
