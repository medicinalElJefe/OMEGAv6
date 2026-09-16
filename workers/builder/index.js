import { DurableObject, WorkflowEntrypoint } from 'cloudflare:workers';

const REVISION = 'R314';
const CONTRACT = 'OMEGA_CLOUDFLARE_BUILDER_CONTROL_PLANE_V1';
const DEFAULT_PUBLIC_URL = 'https://omegav6.jeffdeweyeljefe.workers.dev';
const DEFAULT_REPOSITORY = 'medicinalElJefe/OMEGAv6';
const AUTONOMOUS_BRANCH_PREFIXES = ['selfbuild/r170-', 'cloud/evolution-'];

function now() {
  return new Date().toISOString();
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2) + '\n', {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-omega-builder-revision': REVISION,
      ...headers,
    },
  });
}

async function responseSnapshot(response) {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return {
    ok: response.ok,
    status: response.status,
    data,
    textSample: data ? undefined : text.slice(0, 240),
  };
}

async function fetchJson(url, init = {}) {
  try {
    const response = await fetch(url, {
      ...init,
      method: 'GET',
      headers: {
        accept: 'application/vnd.github+json, application/json',
        'user-agent': 'OMEGAv6-R314-Builder-Control-Plane',
        'cache-control': 'no-cache',
        ...(init.headers || {}),
      },
    });
    return await responseSnapshot(response);
  } catch (error) {
    return { ok: false, status: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

async function observeCanonical(env) {
  const repository = env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY;
  const publicBase = (env.OMEGA_PUBLIC_URL || DEFAULT_PUBLIC_URL).replace(/\/$/, '');
  const githubBase = `https://api.github.com/repos/${repository}`;

  const publicHealthPromise = fetchJson(`${publicBase}/api/core-health`);
  const githubMainPromise = fetchJson(`${githubBase}/branches/main`);
  const githubRunsPromise = fetchJson(`${githubBase}/actions/workflows/ci.yml/runs?branch=main&per_page=20`);
  const githubPrsPromise = fetchJson(`${githubBase}/pulls?state=open&base=main&per_page=100`);

  let serviceHealth;
  try {
    const response = await env.OMEGA_CANONICAL.fetch(
      new Request('https://omegav6.internal/api/core-health', {
        method: 'GET',
        headers: { 'cache-control': 'no-cache', 'x-omega-builder-probe': REVISION },
      }),
    );
    serviceHealth = await responseSnapshot(response);
  } catch (error) {
    serviceHealth = { ok: false, status: 0, error: error instanceof Error ? error.message : String(error) };
  }

  const [publicHealth, githubMain, githubRuns, githubPrs] = await Promise.all([
    publicHealthPromise,
    githubMainPromise,
    githubRunsPromise,
    githubPrsPromise,
  ]);

  return {
    schema: 'OMEGA_R314_OBSERVATION_V1',
    observedAt: now(),
    repository,
    publicBase,
    canonicalPublic: publicHealth,
    canonicalService: serviceHealth,
    github: {
      main: githubMain,
      ciRuns: githubRuns,
      openPullRequests: githubPrs,
    },
  };
}

function deriveDecision(observation) {
  const mainSha = observation.github?.main?.data?.commit?.sha || null;
  const runs = Array.isArray(observation.github?.ciRuns?.data?.workflow_runs)
    ? observation.github.ciRuns.data.workflow_runs
    : [];
  const prs = Array.isArray(observation.github?.openPullRequests?.data)
    ? observation.github.openPullRequests.data
    : [];

  const productionRun = runs.find((run) =>
    run?.head_sha === mainSha &&
    run?.status === 'completed' &&
    run?.conclusion === 'success' &&
    ['push', 'workflow_dispatch'].includes(run?.event),
  ) || null;

  const autonomousCandidates = prs
    .map((pr) => ({ number: pr?.number, head: pr?.head?.ref || '', url: pr?.html_url || null }))
    .filter((pr) => AUTONOMOUS_BRANCH_PREFIXES.some((prefix) => pr.head.startsWith(prefix)));

  const publicCore = observation.canonicalPublic?.data;
  const serviceCore = observation.canonicalService?.data;
  const publicHealthy = observation.canonicalPublic?.ok === true && publicCore?.ok === true && publicCore?.state === 'LIVE';
  const serviceHealthy = observation.canonicalService?.ok === true && serviceCore?.ok === true && serviceCore?.state === 'LIVE';
  const sourceObserved = Boolean(mainSha) && observation.github?.main?.ok === true;

  let decision = 'TURN';
  let reason = 'GOVERNED_SELFBUILD_ELIGIBLE';
  let nextAction = 'R170_MAY_PROPOSE_ONE_BOUNDED_CANDIDATE';

  if (!sourceObserved) {
    decision = 'ESCALATE';
    reason = 'SOURCE_OBSERVATION_FAILED';
    nextAction = 'RESTORE_GITHUB_SOURCE_OBSERVATION';
  } else if (!publicHealthy || !serviceHealthy) {
    decision = 'ESCALATE';
    reason = 'CANONICAL_RUNTIME_UNHEALTHY';
    nextAction = 'REPAIR_CANONICAL_RUNTIME_BEFORE_ADVANCEMENT';
  } else if (!productionRun) {
    decision = 'STAY';
    reason = 'EXACT_MAIN_PRODUCTION_PROOF_REQUIRED';
    nextAction = 'WAIT_FOR_OR_REPAIR_CANONICAL_CI_PROOF';
  } else if (autonomousCandidates.length > 1) {
    decision = 'ESCALATE';
    reason = 'AUTONOMOUS_CANDIDATE_FENCE_VIOLATION';
    nextAction = 'CONVERGE_TO_ONE_GOVERNED_CANDIDATE';
  } else if (autonomousCandidates.length === 1) {
    decision = 'STAY';
    reason = 'GOVERNED_CANDIDATE_IN_FLIGHT';
    nextAction = 'PROVE_OR_CLOSE_EXISTING_CANDIDATE';
  }

  return {
    schema: 'OMEGA_R314_BUILD_DECISION_V1',
    revision: REVISION,
    decidedAt: now(),
    decision,
    reason,
    nextAction,
    evidence: {
      mainSha,
      productionProven: Boolean(productionRun),
      productionRunId: productionRun?.id || null,
      productionRunUrl: productionRun?.html_url || null,
      canonicalPublicHealthy: publicHealthy,
      canonicalServiceHealthy: serviceHealthy,
      autonomousCandidates,
    },
    authority: {
      canonicalAdmission: 'R125',
      dispatchSelection: 'R147',
      durableExecutionHistory: 'R146',
      hybridReturnProof: 'R141',
      sourceSelfBuild: 'R170/R240',
      productionDeploymentWriter: 'ci.yml',
      builderRole: 'OBSERVE_CORRELATE_LEDGER_ADVISE',
      sourceMutationAuthorized: false,
      canonAdmissionAuthorized: false,
      productionPromotionAuthorized: false,
    },
  };
}

async function ledgerStub(env) {
  const id = env.BUILD_LEDGER.idFromName('canonical');
  return env.BUILD_LEDGER.get(id);
}

async function persistReceipt(env, observation, decision, trigger) {
  const stub = await ledgerStub(env);
  const receipt = {
    schema: 'OMEGA_R314_BUILD_RECEIPT_V1',
    receiptId: `R314-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
    recordedAt: now(),
    trigger,
    observation,
    decision,
  };
  const response = await stub.fetch('https://ledger.internal/append', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(receipt),
  });
  if (!response.ok) throw new Error(`builder ledger append failed: HTTP ${response.status}`);
  return receipt;
}

export class OmegaBuilderLedger extends DurableObject {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/append') {
      const receipt = await request.json();
      const state = (await this.ctx.storage.get('state')) || {
        schema: 'OMEGA_R314_LEDGER_STATE_V1',
        revision: REVISION,
        receipts: [],
      };
      const receipts = [...(state.receipts || []), receipt].slice(-256);
      const next = {
        ...state,
        updatedAt: now(),
        latest: receipt,
        receipts,
      };
      await this.ctx.storage.put('state', next);
      return json({ ok: true, receiptId: receipt.receiptId, retained: receipts.length });
    }

    const state = (await this.ctx.storage.get('state')) || {
      schema: 'OMEGA_R314_LEDGER_STATE_V1',
      revision: REVISION,
      updatedAt: null,
      latest: null,
      receipts: [],
    };

    if (request.method === 'GET' && url.pathname === '/status') {
      return json({
        schema: state.schema,
        revision: state.revision,
        updatedAt: state.updatedAt,
        latest: state.latest,
        receiptCount: state.receipts.length,
      });
    }

    if (request.method === 'GET' && url.pathname === '/ledger') {
      const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit') || 20)));
      return json({
        schema: state.schema,
        revision: state.revision,
        updatedAt: state.updatedAt,
        receipts: state.receipts.slice(-limit),
      });
    }

    return json({ error: 'NOT_FOUND' }, 404);
  }
}

export class OmegaBuildWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const trigger = event?.payload?.trigger || 'scheduled';
    const observation = await step.do('observe canonical source and runtime', async () => {
      return await observeCanonical(this.env);
    });

    const decision = await step.do('derive governed build decision', async () => {
      return deriveDecision(observation);
    });

    const receipt = await step.do('persist builder ledger receipt', async () => {
      return await persistReceipt(this.env, observation, decision, trigger);
    });

    return {
      schema: CONTRACT,
      revision: REVISION,
      receiptId: receipt.receiptId,
      decision,
    };
  }
}

function authorized(request, env) {
  if (!env.OMEGA_BUILDER_TOKEN) return false;
  const value = request.headers.get('authorization') || '';
  return value === `Bearer ${env.OMEGA_BUILDER_TOKEN}`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/api/health')) {
      return json({
        ok: true,
        state: 'LIVE',
        schema: CONTRACT,
        revision: REVISION,
        role: 'OBSERVE_CORRELATE_LEDGER_ADVISE',
        canonicalRuntime: env.OMEGA_PUBLIC_URL || DEFAULT_PUBLIC_URL,
        repository: env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY,
        authority: {
          sourceMutationAuthorized: false,
          canonAdmissionAuthorized: false,
          productionPromotionAuthorized: false,
          productionDeploymentWriter: 'ci.yml',
        },
      });
    }

    if (request.method === 'GET' && url.pathname === '/api/status') {
      const stub = await ledgerStub(env);
      const response = await stub.fetch('https://ledger.internal/status');
      const data = await response.json();
      return json({
        ...data,
        schema: CONTRACT,
        revision: REVISION,
        role: 'OBSERVE_CORRELATE_LEDGER_ADVISE',
      }, response.status);
    }

    if (request.method === 'POST' && url.pathname === '/api/run') {
      if (!env.OMEGA_BUILDER_TOKEN) {
        return json({ error: 'AUTH_REQUIRED', detail: 'OMEGA_BUILDER_TOKEN is not configured; scheduled Workflow remains active.' }, 503);
      }
      if (!authorized(request, env)) return json({ error: 'UNAUTHORIZED' }, 401);
      const instance = await env.BUILD_CYCLE.create({ params: { trigger: 'authorized-api' } });
      return json({ ok: true, workflowId: await instance.id, state: 'STARTED' }, 202);
    }

    return json({ error: 'NOT_FOUND' }, 404);
  },
};
