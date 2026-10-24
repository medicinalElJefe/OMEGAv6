import {useMemo,useState} from 'react';
import {R681_DECISION_AUDIT,reviewNativeDecisionTruthR681} from './nativeDecisionTruthR681';

const palette:Record<string,string>={STAY:'#7dc5a0',TURN:'#d7ad6d',ESCALATE:'#d88888'};
const fmt=(n:number|null)=>n===null?'UNAVAILABLE':n.toFixed(6);
export function NativeDecisionTruthPanelR681(){
 const [expanded,setExpanded]=useState(false);
 const [basis,setBasis]=useState<'stored'|'recomputed'>('stored');
 const audit=R681_DECISION_AUDIT;
 const proof=useMemo(()=>reviewNativeDecisionTruthR681(audit),[]);
 const samples=basis==='stored'?audit.stored:audit.recomputed;
 return <section data-r681-native-truth='historical-source' style={{border:'1px solid #718091',borderRadius:12,padding:14,marginTop:16}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
    <div><h3 style={{margin:'0 0 6px'}}>Native State Traversal decision evidence</h3>
     <p style={{margin:0}}>Real B053 snapshot · {audit.rows.toLocaleString()} addresses · uncalibrated historical classification</p></div>
    <button type='button' aria-expanded={expanded} onClick={()=>setExpanded(s=>!s)}>{expanded?'Close':'Inspect'} native decision proof</button>
   </div>
   <p><b>Production decision-policy admission: {proof.admission}</b>. This instrument audits historical evidence only. It does not issue operational STAY/TURN/ESCALATE instructions.</p>
   {expanded&&<div>
     <div style={{display:'flex',flexWrap:'wrap',gap:10,margin:'12px 0'}}>
      <button type='button' aria-pressed={basis==='stored'} onClick={()=>setBasis('stored')}>Original saved labels</button>
      <button type='button' aria-pressed={basis==='recomputed'} onClick={()=>setBasis('recomputed')}>Recovered kernel re-evaluation</button>
     </div>
     <div role='group' aria-label='Source classification counts' style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}>
      {(['STAY','TURN','ESCALATE'] as const).map(label=>{
       const count=samples[label],fraction=count/audit.rows;
       return <div key={label} style={{border:'1px solid #5b6b79',padding:12,borderRadius:8}}>
        <b>{label}</b><div style={{fontSize:21,fontVariantNumeric:'tabular-nums'}}>{count.toLocaleString()}</div>
        <div>{(fraction*100).toFixed(3)}% of source states</div>
        <div style={{height:7,background:'rgba(100,110,120,.3)',borderRadius:5,marginTop:8}}>
         <div style={{height:'100%',width:(fraction*100)+'%',background:palette[label],borderRadius:5}}/>
        </div>
       </div>
      })}
     </div>
     <p><b>Saved vs re-evaluated disagreements: {proof.disagreements}</b>. TURN→STAY {audit.savedVsRecoveredKernel.TURN_to_STAY}, ESCALATE→TURN {audit.savedVsRecoveredKernel.ESCALATE_to_TURN}, ESCALATE→STAY {audit.savedVsRecoveredKernel.ESCALATE_to_STAY}.</p>
     <p>Archived saved stability ratios differ from the recovered kernel defaults in <b>{audit.archivedStabilityRatioResidualRows.toLocaleString()}</b> states; the turn-pressure values match in all {audit.rows.toLocaleString()} states at the audit tolerance.</p>
     <p>Saved decision entropy: <b>{fmt(proof.entropyBits)} bits</b> · dominant class <b>{proof.dominantFraction===null?'N/A':(proof.dominantFraction*100).toFixed(3)+'%'}</b>.</p>
     <details><summary>Exact provenance and blocked release gates</summary>
      <p>Source: {audit.nativeOriginal}, snapshot {audit.originalObservedAt}. SHA-256: <code>{audit.snapshotSha256}</code>.</p>
      <p>Reference digest match: {proof.snapshotDigestMatchesReference?'YES':'NO'}. Source bytes independently rehashed in this browser: {proof.sourceBytesIndependentlyVerifiedInBrowser?'YES':'NO'}. The separate Python source audit checks the archived bytes; this static interface does not repeat that verification.</p>
      <p>Comparison algorithm: {audit.recoveredKernelSource}. Its defaults are comparison authority only; the original generator version and empirical outcome labels have not been established.</p>
      <p>The historic source audit is an immutable snapshot, not an ongoing desktop-agent connection or a calibrated physical simulation.</p>
      <ul>{proof.vetoes.map(x=><li key={x}>{x}</li>)}</ul>
     </details>
   </div>}
 </section>;
}
