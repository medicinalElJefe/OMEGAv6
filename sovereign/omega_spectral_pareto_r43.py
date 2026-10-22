#!/usr/bin/env python3
"""OMEGA R43 Pareto frontier for spectral conversion versus PB phase margin.

R43 does not choose an arbitrary margin. It validates a broader bounded geometry
neighborhood at the convergence-qualified grid, then exposes non-dominated
candidates and the best geometry available under several explicit phase-error
budgets.
"""
from __future__ import annotations
import argparse, copy, itertools, json, math
from pathlib import Path
from omega_spectral_optimizer_r41 import screen_candidate, validate_candidate, _geometry_key
from omega_rcwa_worker import _sha

SCHEMA="OMEGA_SPECTRAL_PARETO_v1"; VERSION="R43.0"


def _vals(x): return [float(v) for v in str(x).split(',') if v.strip()]

def _valid(g):
    p,w,l,h=(float(g[k]) for k in ('pitch_nm','width_nm','length_nm','height_nm'))
    return min(p,w,l,h)>0 and w<l and math.hypot(w,l)<=0.95*p

def _dominates(a,b):
    af,bf=a['full'],b['full']
    better_or_equal = af['objective'] >= bf['objective'] and af['max_rms_phase_error_deg'] <= bf['max_rms_phase_error_deg']
    strict = af['objective'] > bf['objective'] or af['max_rms_phase_error_deg'] < bf['max_rms_phase_error_deg']
    return better_or_equal and strict

def build_frontier(base,pitches,widths,lengths,heights,wavelengths=(470.0,532.0,650.0),screen_grid=64,validation_grid=96,top_k=24,margins=(6.0,8.0,10.0,12.0)):
    baseline={k:float(base['geometry'][k]) for k in ('pitch_nm','width_nm','length_nm','height_nm')}
    anchor={'pitch_nm':320.0,'width_nm':100.0,'length_nm':280.0,'height_nm':550.0}
    candidates=[]; seen=set(); failures=[]
    for p,w,l,h in itertools.product(pitches,widths,lengths,heights):
        g={'pitch_nm':p,'width_nm':w,'length_nm':l,'height_nm':h}
        k=_geometry_key(g)
        if k in seen or not _valid(g): continue
        seen.add(k)
        try: candidates.append(screen_candidate(base,g,wavelengths,screen_grid))
        except Exception as e: failures.append({'geometry':g,'stage':'screen','error':f'{type(e).__name__}: {e}'})
    for g in (baseline,anchor):
        k=_geometry_key(g)
        if k not in seen and _valid(g):
            seen.add(k)
            try: candidates.append(screen_candidate(base,g,wavelengths,screen_grid))
            except Exception as e: failures.append({'geometry':g,'stage':'screen-anchor','error':f'{type(e).__name__}: {e}'})
    candidates.sort(key=lambda c:c['screen_score'],reverse=True)

    wanted=[]; used=set()
    anchors={_geometry_key(baseline),_geometry_key(anchor)}
    for c in candidates:
        k=_geometry_key(c['geometry'])
        if k in anchors and k not in used:
            wanted.append(c); used.add(k)
    for c in candidates[:max(1,int(top_k))]:
        k=_geometry_key(c['geometry'])
        if k not in used:
            wanted.append(c); used.add(k)

    validated=[]
    for c in wanted:
        try: validated.append(validate_candidate(base,c,wavelengths,validation_grid))
        except Exception as e: failures.append({'geometry':c['geometry'],'stage':'validation','error':f'{type(e).__name__}: {e}'})
    admitted=[c for c in validated if c['full']['admitted'] and c['full']['objective'] is not None]
    frontier=[]
    for c in admitted:
        if not any(_dominates(o,c) for o in admitted if o is not c): frontier.append(c)
    frontier.sort(key=lambda c:c['full']['max_rms_phase_error_deg'])

    choices={}
    for m in margins:
        ok=[c for c in admitted if c['full']['max_rms_phase_error_deg']<=float(m)]
        ok.sort(key=lambda c:c['full']['objective'],reverse=True)
        choices[str(float(m))]=ok[0] if ok else None

    baseline_result=next((c for c in validated if _geometry_key(c['geometry'])==_geometry_key(baseline)),None)
    anchor_result=next((c for c in validated if _geometry_key(c['geometry'])==_geometry_key(anchor)),None)
    out={'schema':SCHEMA,'version':VERSION,'wavelengths_nm':[float(x) for x in wavelengths],
         'screen_grid':int(screen_grid),'validation_grid':int(validation_grid),'screened_candidates':len(candidates),'validated_candidates':len(validated),
         'phase_margins_deg':[float(x) for x in margins],'baseline':baseline_result,'r41_anchor':anchor_result,
         'choices_by_phase_margin':choices,'pareto_frontier':frontier,'validated':validated,'failures':failures,
         'truth_boundary':'Pareto choices expose a numerical tradeoff between PB phase-error headroom and spectral conversion. No margin is a physical constant; fabrication selection still requires independent solver cross-check and measurement.'}
    out['proof_sha256']=_sha(out); return out

def main():
    p=argparse.ArgumentParser(); p.add_argument('--input',required=True); p.add_argument('--output',required=True)
    p.add_argument('--pitches',default='315,320,325,330,335'); p.add_argument('--widths',default='90,95,100,105'); p.add_argument('--lengths',default='260,270,280,290'); p.add_argument('--heights',default='525,550,575')
    p.add_argument('--wavelengths',default='470,532,650'); p.add_argument('--screen-grid',type=int,default=64); p.add_argument('--validation-grid',type=int,default=96); p.add_argument('--top-k',type=int,default=24); p.add_argument('--margins',default='6,8,10,12')
    a=p.parse_args(); base=json.loads(Path(a.input).read_text('utf-8'))
    out=build_frontier(base,_vals(a.pitches),_vals(a.widths),_vals(a.lengths),_vals(a.heights),_vals(a.wavelengths),a.screen_grid,a.validation_grid,a.top_k,_vals(a.margins))
    Path(a.output).write_text(json.dumps(out,indent=2),'utf-8')
    compact={m:(v['geometry'] if v else None, v['full'] if v else None) for m,v in out['choices_by_phase_margin'].items()}
    print(json.dumps({'screened':out['screened_candidates'],'validated':out['validated_candidates'],'frontier_count':len(out['pareto_frontier']),'choices':compact,'proof_sha256':out['proof_sha256']}))
    return 0
if __name__=='__main__': raise SystemExit(main())
