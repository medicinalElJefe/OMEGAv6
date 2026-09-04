#!/usr/bin/env python3
"""OMEGA R42 robustness-constrained refinement around the R41 provisional winner.

R41 found higher broadband conversion but with a PB phase margin close to the
12-degree admission boundary. R42 keeps the original R38/R39 PB gate and adds a
stricter engineering robustness margin for candidate selection.
"""
from __future__ import annotations
import argparse, json
from pathlib import Path
from omega_spectral_optimizer_r41 import optimize, screen_candidate, validate_candidate, _geometry_key, _sha

SCHEMA="OMEGA_SPECTRAL_REFINEMENT_v1"; VERSION="R42.0"


def _vals(x): return [float(v) for v in str(x).split(',') if v.strip()]


def refine(base,pitches,widths,lengths,heights,wavelengths=(470.0,532.0,650.0),screen_grid=64,validation_grid=96,top_k=12,phase_margin_deg=6.0,anchor=None):
    coarse=optimize(base,pitches,widths,lengths,heights,wavelengths,screen_grid,validation_grid,top_k)
    validated=list(coarse['validated'])
    seen={_geometry_key(c['geometry']) for c in validated}
    if anchor:
        a={k:float(anchor[k]) for k in ('pitch_nm','width_nm','length_nm','height_nm')}
        if _geometry_key(a) not in seen:
            sc=screen_candidate(base,a,wavelengths,screen_grid)
            validated.append(validate_candidate(base,sc,wavelengths,validation_grid))
            seen.add(_geometry_key(a))
    robust=[c for c in validated if c['full']['admitted'] and c['full']['max_rms_phase_error_deg'] <= float(phase_margin_deg)]
    robust.sort(key=lambda c:c['full']['objective'],reverse=True)
    winner=robust[0] if robust else None
    baseline=coarse['baseline']
    anchor_result=None
    if anchor:
        ak=_geometry_key(anchor)
        anchor_result=next((c for c in validated if _geometry_key(c['geometry'])==ak),None)
    improvement=None
    if winner and baseline:
        improvement={
            'objective_delta':winner['full']['objective']-baseline['full']['objective'],
            'min_conversion_delta':winner['full']['min_conversion']-baseline['full']['min_conversion'],
            'mean_conversion_delta':winner['full']['mean_conversion']-baseline['full']['mean_conversion'],
            'red_mean_conversion_delta':winner['full']['red_mean_conversion']-baseline['full']['red_mean_conversion'],
            'phase_error_delta_deg':winner['full']['max_rms_phase_error_deg']-baseline['full']['max_rms_phase_error_deg'],
        }
    out={
        'schema':SCHEMA,'version':VERSION,'phase_margin_deg':float(phase_margin_deg),
        'wavelengths_nm':[float(x) for x in wavelengths],'screen_grid':int(screen_grid),'validation_grid':int(validation_grid),
        'screened_candidates':coarse['screened_candidates'],'validated_candidates':len(validated),
        'baseline':baseline,'r41_anchor':anchor_result,'robust_candidates':robust,'winner':winner,
        'improvement_vs_original_baseline':improvement,'coarse_failures':coarse['failures'],
        'truth_boundary':'The 12-degree PB gate remains the physics admission boundary. The 6-degree refinement margin is an engineering robustness criterion, not a physical law. Numerical optimization is not fabrication validation.'
    }
    out['proof_sha256']=_sha(out); return out


def main():
    p=argparse.ArgumentParser(); p.add_argument('--input',required=True); p.add_argument('--output',required=True)
    p.add_argument('--pitches',default='315,320,325'); p.add_argument('--widths',default='95,100,105'); p.add_argument('--lengths',default='270,280,290'); p.add_argument('--heights',default='525,550,575'); p.add_argument('--wavelengths',default='470,532,650')
    p.add_argument('--screen-grid',type=int,default=64); p.add_argument('--validation-grid',type=int,default=96); p.add_argument('--top-k',type=int,default=12); p.add_argument('--phase-margin',type=float,default=6.0)
    a=p.parse_args(); base=json.loads(Path(a.input).read_text('utf-8'))
    anchor={'pitch_nm':320.0,'width_nm':100.0,'length_nm':280.0,'height_nm':550.0}
    out=refine(base,_vals(a.pitches),_vals(a.widths),_vals(a.lengths),_vals(a.heights),_vals(a.wavelengths),a.screen_grid,a.validation_grid,a.top_k,a.phase_margin,anchor)
    Path(a.output).write_text(json.dumps(out,indent=2),'utf-8')
    print(json.dumps({'winner_geometry':out['winner']['geometry'] if out['winner'] else None,'winner_full':out['winner']['full'] if out['winner'] else None,'r41_anchor_full':out['r41_anchor']['full'] if out['r41_anchor'] else None,'improvement':out['improvement_vs_original_baseline'],'robust_count':len(out['robust_candidates']),'proof_sha256':out['proof_sha256']}))
    return 0
if __name__=='__main__': raise SystemExit(main())
