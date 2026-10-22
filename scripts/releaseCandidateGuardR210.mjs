import {execFileSync} from 'node:child_process';

const repo=process.env.GITHUB_REPOSITORY||'';
const token=process.env.GITHUB_TOKEN||'';
const mode=process.env.OMEGA_RELEASE_GUARD_MODE||'';
const sha=process.env.GITHUB_SHA||'';
const prNumber=Number(process.env.OMEGA_PR_NUMBER||0);
const expectedBase=process.env.OMEGA_EXPECTED_BASE_SHA||'';
if(!repo||!token||!mode)throw new Error('R210 release guard requires repository, token and mode');
const headers={accept:'application/vnd.github+json',authorization:`Bearer ${token}`,'x-github-api-version':'2022-11-28'};
async function api(path){const r=await fetch(`https://api.github.com/repos/${repo}${path}`,{headers});const text=await r.text();if(!r.ok)throw new Error(`${path} HTTP ${r.status}: ${text.slice(0,300)}`);return text?JSON.parse(text):null}
const revisionOf=title=>(String(title||'').match(/\bR\d+(?:\.\d+)?\b/i)||[])[0]?.toUpperCase()||'';

if(mode==='PR'){
 const pr=await api(`/pulls/${prNumber}`);
 if(pr.state!=='open'||pr.base?.ref!=='main')throw new Error('R210 candidate fence requires an open PR targeting main');
 if(expectedBase&&pr.base?.sha!==expectedBase)throw new Error(`R210 base SHA moved: expected ${expectedBase}, PR now sees ${pr.base?.sha}`);
 const revision=revisionOf(pr.title);
 if(!revision)throw new Error('R210 candidate PR title must carry an explicit revision identity such as R210');
 const open=await api('/pulls?state=open&base=main&per_page=100');
 const collisions=open.filter(x=>x.number!==pr.number&&revisionOf(x.title)===revision);
 if(collisions.length)throw new Error(`duplicate revision identity ${revision}: competing PR(s) ${collisions.map(x=>`#${x.number}`).join(', ')}`);
 console.log(`R210 CANDIDATE FENCE PASS · ${revision} · PR #${pr.number} · base ${pr.base.sha} · head ${pr.head.sha} · no duplicate open revision identity`);
 process.exit(0);
}

if(mode==='PUSH'){
 const parents=execFileSync('git',['show','-s','--format=%P',sha],{encoding:'utf8'}).trim().split(/\s+/).filter(Boolean);
 if(parents.length!==2)throw new Error(`R210 promoted main must be a two-parent merge; got ${parents.length}`);
 const [rollback,candidate]=parents;
 const prs=await api(`/commits/${sha}/pulls`);
 const exact=prs.filter(pr=>pr.merged_at&&pr.base?.ref==='main'&&pr.merge_commit_sha===sha&&pr.head?.sha===candidate);
 if(exact.length!==1)throw new Error(`R210 promoted merge must correlate to exactly one merged main PR with candidate ${candidate}; found ${exact.length}`);
 const pr=exact[0],revision=revisionOf(pr.title);
 const runs=await api(`/actions/runs?head_sha=${candidate}&event=pull_request&status=completed&per_page=100`);
 const required=['OMEGA Cloud Bridge CI','R170 Current Convergence','R202 Operational Source Authority'];
 for(const name of required){const ok=(runs.workflow_runs||[]).some(r=>r.name===name&&r.conclusion==='success');if(!ok)throw new Error(`R210 exact candidate ${candidate} lacks successful required PR workflow: ${name}`)}
 console.log(`R210 PROMOTION FENCE PASS · ${revision||'REVISION'} · PR #${pr.number} · rollback ${rollback} · candidate ${candidate} · promoted ${sha} · exact PR/head correlation + required green workflows`);
 process.exit(0);
}
throw new Error(`unsupported R210 release guard mode ${mode}`);
