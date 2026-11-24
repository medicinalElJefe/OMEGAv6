import {useMemo,useState} from 'react';
import index from '../audit/omega-drive-historical-archive-source-index-r936.json';
import witnesses from '../audit/omega-historical-byte-witnesses-r944.json';
import fullB043 from '../audit/omega-b043-full-source-byte-acceptance-r948.json';
import moduleProof from '../audit/omega-b043-module-test-evidence-r949.json';
import r7Proof from '../audit/omega-b053-r7-full-source-acceptance-r950.json';
import r7Tests from '../audit/omega-b053-r7-isolated-module-parity-r951.json';
import v35Proof from '../audit/omega-v35-full-source-acceptance-r953.json';

const displaySize=(bytes:number)=>(bytes/(1024*1024)).toFixed(1)+' MiB';
const fileUrl=(id:string)=>'https://drive.google.com/file/d/'+encodeURIComponent(id)+'/view';

export default function DriveHistoricalRecoveryR936({onAuditRelease}:{onAuditRelease?:(release:string)=>void}={}){
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState('ALL');
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const filtered=useMemo(()=>index.groups.filter(g=>selected==='ALL'||g.id===selected).map(g=>({
  ...g,parts:g.parts.filter(part=>terms.every(term=>(g.id+' '+g.label+' '+part.filename).toLowerCase().includes(term)))
 })).filter(g=>g.parts.length>0||(!terms.length&&(selected==='ALL'||g.id===selected))),[query,selected]);
 const companions=useMemo(()=>index.companionZipArchives.filter(x=>terms.every(term=>x.filename.toLowerCase().includes(term))),[query]);
 const exportSourceIndex=()=>{
  const blob=new Blob([JSON.stringify(index,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download='OMEGA_DRIVE_ARCHIVE_SOURCE_INDEX_R936.json';anchor.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <section data-r936-drive-recovery='SOURCE_INDEX_NOT_EXECUTION_CERTIFICATION' aria-label='Historical Drive recovery sources' style={{padding:12,border:'1px solid #60758c',borderRadius:10,margin:'12px 0'}}>
  <header><h3>Drive historical recovery · source-linked distributions</h3>
   <p>{index.counts.splitFamilies} separately identified split releases · {index.counts.discoveredParts}/{index.counts.expectedParts} named parts · {index.counts.companionZipArchives} companion ZIP archives.</p>
   <p><strong>Original source bytes verified:</strong> {fullB043.verifiedWrapperCount+r7Proof.wrapperCount+v35Proof.sourcePartsVerified} / {index.counts.discoveredParts} numbered ZIP parts (all B043, B053 R7 and V35). All other parts remain unverified: {index.counts.discoveredParts-fullB043.verifiedWrapperCount-r7Proof.wrapperCount-v35Proof.sourcePartsVerified}.</p>
   <p><strong>Verification boundary:</strong> Drive file metadata confirms filenames and reported sizes only. Historical PASS reports do not establish present SHA-256 integrity, ZIP extraction safety, executable capability, Canon admission or GPU proof. No archive is auto-extracted, executed or uploaded.</p>
  </header>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'12px 0'}}>
   <label>Release<select aria-label='Recovery release' value={selected} onChange={e=>setSelected(e.target.value)}><option value='ALL'>All indexed releases</option>{index.groups.map(g=><option key={g.id} value={g.id}>{g.id}</option>)}</select></label>
   <label>Find archive<input aria-label='Search recovered source archives' value={query} onChange={e=>setQuery(e.target.value)} placeholder='Part number, release or filename'/></label>
   <button type='button' onClick={exportSourceIndex}>Export verified-source inventory metadata</button>
  </div>
  {filtered.length===0&&<p role='status'>No indexed split archives match. Try a different release or filename.</p>}
  {filtered.map(g=><details key={g.id} data-r936-release={g.id} style={{borderTop:'1px solid #60758c',padding:'10px 0'}}>
   <summary><strong>{g.label}</strong> · {g.parts.length}/{g.expectedParts} matching named parts · {displaySize(g.parts.reduce((n,p)=>n+p.bytes,0))} indexed</summary>
   <p><a href={g.folderUrl} target='_blank' rel='noreferrer'>Open original Drive folder</a> · {g.sourceState.replaceAll('_',' ').toLowerCase()}</p>
   {g.reportedEvidence&&'partDigestManifest' in g.reportedEvidence&&<p>Historical recorded SHA-256 expectations: {g.parts.filter(p=>'sha256' in p).length} part digests from {g.reportedEvidence.partDigestManifest}. These must match current local bytes before source-authority claims.</p>}
   {onAuditRelease&&<button type='button' data-r941-select-release={g.id} onClick={()=>onAuditRelease(g.id)}>Prepare authenticated local audit of {g.id}</button>}
   {g.reportedEvidence&&<p>Historical evidence: {g.reportedEvidence.manifest} · {g.reportedEvidence.evidenceState.replaceAll('_',' ').toLowerCase()}{'masterSha256' in g.reportedEvidence&&<code style={{display:'block',overflowWrap:'anywhere'}}>Expected reconstructed master SHA-256: {g.reportedEvidence.masterSha256}</code>}</p>}
   {g.id==='V35'&&<p><strong>Full V35 archive bytes accepted:</strong> all {v35Proof.sourcePartsVerified} outer ZIPs and {v35Proof.originalBasePayloadsVerified} original payloads plus {v35Proof.originalExpansionArchivesVerified} expansion archives match their original SHA-256 manifests. Installer/runtime behavior and GPU acceptance remain separate proof gates.</p>}
   {g.id==='B053-R7'&&<p><strong>B053 R7 original source reconstructed:</strong> {r7Proof.wrapperCount}/30 Drive ZIP wrappers, {r7Proof.reconstructedZipMembers.toLocaleString()} master ZIP CRC members, and {r7Proof.internalManifestFilesIndependentlyRehashed.toLocaleString()} files independently rehashed against the embedded source manifest. Master observed SHA-256: <code style={{overflowWrap:'anywhere'}}>{r7Proof.reconstructedMasterObservedSha256}</code>. The original {r7Tests.currentObserved.modulesReplayed} B053 R7 test modules independently reproduced {r7Tests.currentObserved.passed} passing tests in isolated local processes. These do not establish OMEGA7 runtime parity or native Windows GPU proof.</p>}
   {g.id==='B043'&&<p><strong>Full original B043 recovered:</strong> 29/29 outer and embedded SHA-256s and CRCs verified; 2,778,646,289-byte master, 1,891 ZIP members passed CRC. <code style={{overflowWrap:'anywhere'}}>{fullB043.masterObservedSha256}</code>. Original historical tests: {moduleProof.passedTestsAcrossPerModuleExecutions} cases pass across {moduleProof.testModuleCount} separate isolated test modules. The combined 62-case suite timed out, and OMEGA7 executor parity remains unproven.</p>}
   <ol>{g.parts.map(p=><li key={p.driveId}><a href={fileUrl(p.driveId)} target='_blank' rel='noreferrer'>{p.filename}</a> · {displaySize(p.bytes)} · source ID <code>{p.driveId}</code>{g.id==='V35'&&v35Proof.parts.some(w=>w.driveId===p.driveId)&&<strong style={{display:'block'}}>Original V35 wrapper CRC and independent payload/expansion SHA-256 accepted · R953</strong>}{g.id==='B053-R7'&&r7Proof.parts.some(w=>w.driveId===p.driveId)&&<strong style={{display:'block'}}>B053 R7 complete wrapper and embedded payload CRC, SHA-256 and 1,856 inner source-file checks · R950</strong>}{g.id==='B043'&&fullB043.sourceParts.some(w=>w.driveId===p.driveId)&&<strong style={{display:'block'}}>B043 fully reconstructed source ZIP+chunk SHA-256 and CRC accepted · R948</strong>}{g.id!=='B043'&&witnesses.witnesses.some(w=>w.driveId===p.driveId&&'sha256' in p&&w.observedSha256===p.sha256)&&<strong style={{display:'block'}}>Exact downloaded part SHA-256, ZIP CRC and inner payload hash independently checked · R944</strong>}</li>)}</ol>
  </details>)}
  <details data-r936-companions='true'><summary><strong>Separate historical workstation ZIPs and reconstruction kits</strong> · {companions.length} matching</summary>
   <ul>{companions.map(x=><li key={x.driveId}><a href={fileUrl(x.driveId)} target='_blank' rel='noreferrer'>{x.filename}</a> · {displaySize(x.bytes)}</li>)}</ul>
  </details>
  <p>Local recovery path: obtain the exact untouched source archives; verify hashes against each version's original manifest; use the authenticated OMEGA Local / Edge Hub's HISTORICAL_ZIP_AUDIT before controlled reconstruction. Keep every version isolated until provenance, tests and executor contracts pass.</p>
 </section>;
}
