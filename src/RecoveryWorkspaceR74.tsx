import {useState} from 'react';
import {ChevronDown,HardDrive,Link2,ShieldCheck,Wrench} from 'lucide-react';
import RecoveryPackagingR47 from './RecoveryPackagingR47';
import TargetActivationR48 from './TargetActivationR48';

type Props={record:any;address:number;onNavigate:(name:string)=>void};

export default function RecoveryWorkspaceR74({record,address,onNavigate}:Props){
  const [expert,setExpert]=useState(false);
  const [restoreOpen,setRestoreOpen]=useState(false);
  return <section className='panel'>
    <div className='section-head'>
      <div>
        <p className='overline'>RECOVERY · DIRECT ACTION WORKSPACE</p>
        <h2>Restore or connect this PC</h2>
      </div>
      <span className='pill'>DEVICE PROOF REQUIRED</span>
    </div>
    <p className='muted'>Choose the task, not the implementation detail. Browser readiness is never treated as PC connectivity; native execution becomes verified only after the paired Windows host returns authenticated evidence.</p>

    <div className='buildout-lanes'>
      <article>
        <Link2/>
        <b>1 · Connect this PC</b>
        <p>Open Hybrid Link for browser credential, Windows launcher, authentication and heartbeat proof. PC ONLINE remains gated on a current authenticated heartbeat.</p>
        <button className='primary-action' onClick={()=>onNavigate('Hybrid Link')}>Open Hybrid Link</button>
      </article>
      <article>
        <HardDrive/>
        <b>2 · Restore authoritative package</b>
        <p>Use the retained B015 handoff only when a package restore is actually needed. Hash, bootstrap and rollback details stay behind this action.</p>
        <button onClick={()=>setRestoreOpen(v=>!v)}>{restoreOpen?'Hide restore package':'Open restore package'} <ChevronDown size={15}/></button>
      </article>
      <article>
        <ShieldCheck/>
        <b>3 · Verify returned proof</b>
        <p>Inspect technical receipts after the PC has acted. Generated browser files are preparation, not device proof and not release authority.</p>
        <button onClick={()=>onNavigate('Evidence & Proof')}>Open Evidence & Proof</button>
      </article>
    </div>

    <div className='boundary'><ShieldCheck size={15}/>Current model address {address.toLocaleString()} remains a representational interface state. Restore, Hybrid, rollback and deployment authority remain independently gated.</div>

    {restoreOpen&&<div style={{marginTop:16}}><TargetActivationR48/></div>}

    <details className='drawer' open={expert} onToggle={e=>setExpert((e.currentTarget as HTMLDetailsElement).open)}>
      <summary><Wrench size={15}/> Technical recovery & package controls</summary>
      <p className='muted'>Checksums, patch staging, browser recovery exports, manifests and package internals are retained for expert use without occupying the primary workflow.</p>
      <RecoveryPackagingR47 record={record} address={address}/>
      {!restoreOpen&&<TargetActivationR48/>}
    </details>
  </section>;
}
