// Frozen transcription of previously charted Dewey/OMEGA calibration contracts.
// These are reference models and proof gates, not new SAR measurements.

export const FOLD_SCALE_CANON = Object.freeze({
  source: 'Fold_Scale_Relativity_Calibration_Test_Harness_v1 / fold_scale_relativity_calibration_test_harness',
  stateSpace: { axes: ['D','P','R','L'], base: 12, states: 20736, semantics: 'address/index space, not literal physical dimensions' },
  truthContract: 'Formal system first; empirical proof second; symbolic layers remain symbolic until measured.',
  masterState: 'S_t=(X_t,R_t,E_t,M_t,B_t,Phi_t,C_t,Lambda_t,q_t,t)',
  coreEquation: 'S_(t+1)=Omega_gate[K_c(T_theta(S_t)) + 011(S_t) - 01-1(S_t) + lambda*M_t + Delta_t - (Lambda_t + q_t - g_t)]',
  equations: {
    foldScale: 'F_(theta,c)(S_t)=K_c(T_theta(S_t))',
    construct: '011=T_(+pi/2)',
    prune: '01-1=T_(-pi/2)',
    memory: 'M_(t+1)=lambda*M_t+Delta_t',
    burden: 'Lambda_(t+1)=max(0,Lambda_t+q_t-g_t)',
    omega: 'Omega_t=E_t/(1+Lambda_t+abs(q_t))',
    dispatch: 'STAY if Omega>1; TURN if abs(Omega-1)<=tau; ESCALATE if Omega<1-tau',
    shellContrasts: ['u1=a1-a4','u2=a2-a5','u3=a3-a6'],
    simplex: 'lambda_i=abs(u_i)/(abs(u1)+abs(u2)+abs(u3)+epsilon)',
    truthRank: 'Truth=Survival(R | F_(theta,c),Omega_gate,B,t)'
  },
  variableContract: {
    E: { name:'continuity capacity', calibration:'host-measured capacity/resource margin', range:'normalized 0..1 or declared host units' },
    M: { name:'memory/scar', calibration:'retained history / lagged state', range:'normalized 0..1 or declared vector' },
    Lambda: { name:'burden/load', calibration:'cost, strain, missingness, debt or load appropriate to host', range:'normalized >=0 or declared host units' },
    q: { name:'contradiction/instability', calibration:'error, variance, conflict or anomaly appropriate to host', range:'normalized 0..1 preferred' },
    g: { name:'integration success', calibration:'resolved contradiction / restoration / completion', range:'normalized >=0' },
    Phi: { name:'phase orientation', calibration:'observed phase estimator or declared phase map', range:'radians mod 2pi' },
    C: { name:'compression scale', calibration:'representation/scale ratio', range:'c>0' }
  },
  validity: {
    atlas:'KEEP as classification/indexing; prune literal ontology claim',
    shell:'KEEP only where measured local neighborhood exists',
    geometry:'host visualization/adjoining scaffold must be benchmarked against alternatives',
    empirical:'claims require measured observations and baseline comparison'
  }
});

export const EMPIRICAL_TURN_PROFILES = Object.freeze({
  canonicalS: { label:'Canonical S', threshold:0.8293400791736596, orientation:'higher=TURN', auc:0.9176136363636364, balancedAccuracy:0.8456439393939394, accuracy:0.855, sensitivity:0.8333333333333334, specificity:0.8579545454545454, permutationP:0.0012484394506866 },
  wovenS: { label:'Woven S', threshold:0.3686657561111039, orientation:'higher=TURN', auc:0.9010416666666666, balancedAccuracy:0.834280303030303, accuracy:0.74, sensitivity:0.9583333333333334, specificity:0.7102272727272727, permutationP:0.0012484394506866 },
  masterField: { label:'Master field', threshold:0.0374083197246837, orientation:'higher=TURN', auc:0.8548768939393939, balancedAccuracy:0.8011363636363636, accuracy:0.745, sensitivity:0.875, specificity:0.7272727272727273, permutationP:0.0012484394506866 },
  omega: { label:'Omega', threshold:0.442882, orientation:'higher=TURN', auc:0.8477746212121212, balancedAccuracy:0.7784090909090908, accuracy:0.895, sensitivity:0.625, specificity:0.9318181818181818, permutationP:0.0012484394506866 },
  decisionPressure: { label:'Stored decision pressure', threshold:0.879964, orientation:'lower=TURN', auc:0, balancedAccuracy:1, accuracy:1, sensitivity:1, specificity:1, permutationP:0.0012484394506866 }
});

export const WOVEN_RELEASE_CALIBRATION = Object.freeze({
  source: 'Dewey_Woven_Calibration_Audit_v2',
  rows: 400,
  method: 'mean-centered bounded modulation using observed release min/max',
  C: { mean:0.66276124, min:0.565845, max:0.737329, calibrated24Mean:0.650437354 },
  q: { mean:0.279078905, min:0.21021, max:0.340193, calibrated24Mean:0.27229347 },
  Lambda: { mean:0.33249606, min:0.220668, max:0.430385, calibrated24Mean:0.339011986 },
  Phi: { mean:0.670355005, min:0.556455, max:0.752786, calibrated24Mean:0.699420514 },
  Omega: { mean:0.411451365, min:0.362521, max:0.445543, calibrated24Mean:0.422270314 },
  symmetry: { mean:0.79599502, min:0.76495, max:0.813123, calibrated24Mean:0.804834745 },
  asymmetry: { mean:0.30658721, min:0.238004, max:0.34058, calibrated24Mean:0.32160481 },
  coexistence: { mean:0.995938155, min:0.945336, max:1, calibrated24Mean:0.998917264 },
  relativeTruth: { mean:71.243633, min:61.5994, max:79.3731, calibrated24Mean:75.103382833 },
  absoluteTruth: { mean:67.6282435, min:60.7819, max:73.3588, calibrated24Mean:70.612740458 }
});

export const EARTH_PROXY_CHART = Object.freeze({
  source:'earth_topology_full_real_thread_atlas',
  cells:2664,
  warning:'Full proxy charting pass; not meter-accurate raw DEM/bathymetry extraction.',
  summary:{ strongCells:869, usefulPlusCells:1741, avgThreadScore:0.6653, avgAlignment:0.6127 },
  tiers:{ strong:{minThreadScore:0.75,count:869,avgThreadScore:0.9343,avgAlignment:0.6498}, useful:{minThreadScore:0.55,count:872,avgThreadScore:0.6471,avgAlignment:0.6529}, weak:{count:725,avgThreadScore:0.4639,avgAlignment:0.5507}, contradiction:{count:198,avgThreadScore:0.3019,avgAlignment:0.5003} },
  correlations:{ motionVsElevation:-0.1248, waterVsElevation:0.0348, scarVsElevation:0.1137, basinPullVsElevation:0.0324, coriolisVsElevation:0.1878, threadVsElevation:0.149, threadVsReliefAlignment:0.1269, depthMotionVsElevation:-0.8904, waterBathyVsElevation:-0.8752, orogenicScarVsElevation:0.5982 },
  lenses:[
    {id:'abyssal',label:'Abyssal basin-pull water thread',rule:'negative relief + high basin pull + high water triangle'},
    {id:'gyre',label:'Gyre-coriolis shear thread',rule:'high coriolis strength + water geometry'},
    {id:'orogenic',label:'Orogenic motion-scar thread',rule:'positive relief + scar carry + slope'},
    {id:'quiet',label:'Quiet continuity field',rule:'high alignment + low extreme tension; preferred calibration anchor'},
    {id:'contradiction',label:'Contradiction lens',rule:'low relief alignment or sign mismatch; requires raw DEM/GEBCO resolution'}
  ]
});

export const PRIOR_VALIDATION_REFERENCES = Object.freeze([
  { id:'PSC_HELDOUT_RECORDED', rows:149679, r2:0.8785, maeImprovementVsBaselinePct:65.84, status:'RECORDED_SINGLE_DATASET_RESULT', sarCalibration:false },
  { id:'PLANCK_20736_REPRODUCTION', cells:20736, maxRelativeResidual:1.42e-14, status:'RECORDED_NUMERICAL_REPRODUCTION', sarCalibration:false },
  { id:'SEED_CHAIN_600', rows:600, trainRows:420, testRows:180, baselineMAE:0.1067787442837301, deweyMAE:0.0281954303372119, deweyRMSE:0.0362083255507555, deweyR2:0.9180417606289796, improvementVsBaselinePct:73.59452901759957, status:'DEWEY_METHOD_SUPPORTED_ON_THIS_DATASET', sarCalibration:false }
]);

export const PROOF_BOUNDARY = Object.freeze({
  rule:'Repeated atlas/workbook views are not independent confirmation.',
  externalProof:'New physical/scientific claims require external prediction, replication and baseline comparison.',
  sarRule:'Prior chart metrics may initialize/reference the SAR host adapter but cannot count as SAR validation observations.'
});
