import {FAMILIES,type SystemFamilyStatus} from './systemAtlasRuntime';

export type SuccessorReality='WEB_ACTIVE'|'SOURCE_ACTIVE'|'LOCAL_ACTIVE'|'EVIDENCE_GATED'|'DEVICE_GATED';
export type CompletionFamily={id:string;name:string;historical:SystemFamilyStatus;successor:SuccessorReality;surface:string;proof:string;remaining:string};

const OVERRIDE:Record<string,{successor:SuccessorReality;surface:string;proof:string;remaining:string}>={
 S00:{successor:'WEB_ACTIVE',surface:'System / Workspace / Cockpit',proof:'hosted shell + route regression + live Worker proof',remaining:'native desktop host remains separate target proof'},
 S01:{successor:'SOURCE_ACTIVE',surface:'Reality Lab',proof:'canonical packet → analysis compiler',remaining:'native compiler breadth remains host-dependent'},
 S02:{successor:'SOURCE_ACTIVE',surface:'Field / traversal substrate',proof:'20,736 source packet + state channels',remaining:'none inside hosted representational scope'},
 S03:{successor:'DEVICE_GATED',surface:'Hybrid Link',proof:'typed mission/status/proof contracts + R127 zero-drift transport + R153 adaptive returned-proof continuation',remaining:'paired PC/phone execution requires current returned device proof'},
 S04:{successor:'EVIDENCE_GATED',surface:'Canon Evolution',proof:'proposal/governance surfaces + proof boundary',remaining:'constitutional admission remains release-authority gated'},
 S05:{successor:'EVIDENCE_GATED',surface:'Governance / Forecast',proof:'relational/governance projections',remaining:'historical executable breadth not independently proven'},
 S06:{successor:'SOURCE_ACTIVE',surface:'Atlas',proof:'144/1,728/20,736 addressing + admitted routes',remaining:'none inside hosted atlas scope'},
 S07:{successor:'SOURCE_ACTIVE',surface:'Visual Instrument',proof:'shell/mandala projections over canonical packet',remaining:'native/GPU shell breadth remains separate'},
 S08:{successor:'SOURCE_ACTIVE',surface:'Visual Instrument',proof:'packet-bound field renderer + export',remaining:'high-end GPU production remains native target'},
 S09:{successor:'EVIDENCE_GATED',surface:'Earth Now',proof:'WGS84 + returned provider evidence',remaining:'unavailable GIS/DEM/LiDAR must remain unavailable'},
 S10:{successor:'SOURCE_ACTIVE',surface:'Matter Traversal',proof:'R46 organism→atom semantic scale traversal',remaining:'microscopy/clinical measurement adapters are not claimed'},
 S11:{successor:'LOCAL_ACTIVE',surface:'Build Out',proof:'R47 SHA-256 patch plans + safe target validation + recovery manifests',remaining:'native filesystem mutation requires target-host proof'},
 S12:{successor:'LOCAL_ACTIVE',surface:'Build Out',proof:'R154 hashed portable sovereign ZIP + JSON seed export with manifest/proof boundary',remaining:'self-deploying installer execution remains native gated'},
 S13:{successor:'SOURCE_ACTIVE',surface:'Matter Traversal',proof:'continuity/plasticity/scar/contradiction membrane channels',remaining:'none inside hosted model scope'},
 S14:{successor:'SOURCE_ACTIVE',surface:'Modes',proof:'source-backed STAY/TURN/ESCALATE + gated missing inputs',remaining:'missing authoritative inputs remain gated'},
 S15:{successor:'EVIDENCE_GATED',surface:'Evidence & Proof',proof:'hash/ledger/replay/proof surfaces',remaining:'proof cannot exceed checks actually performed'},
 S16:{successor:'LOCAL_ACTIVE',surface:'Plugins / System Atlas',proof:'R154 CSV/JSON/XLSX SHA-256 intake + real first-sheet XLSX parsing + bounded XLSX round-trip writer',remaining:'Excel macro execution and formula recalculation remain outside browser execution; stored formula values are read without inventing recalculation'},
 S17:{successor:'LOCAL_ACTIVE',surface:'System Atlas',proof:'12-lane browser WebAudio engine',remaining:'sonification is not measured physical frequency'},
 S18:{successor:'LOCAL_ACTIVE',surface:'Plugins / Instructions',proof:'R46 deterministic packet↔lexicon routing',remaining:'universal translation or inferred-intent authority is not claimed'},
 S19:{successor:'SOURCE_ACTIVE',surface:'Relativity',proof:'observer/phase/relative-frame projections',remaining:'none inside hosted observer-model scope'},
 S20:{successor:'LOCAL_ACTIVE',surface:'Archive Operators',proof:'R48 fingerprinted recovery queue + disposition receipt',remaining:'donor promotion still requires governed proof'},
 S21:{successor:'LOCAL_ACTIVE',surface:'Visual Instrument',proof:'R46 packet-bound browser SVG cinematic stills',remaining:'native GPU/video production remains target-gated'},
 S22:{successor:'LOCAL_ACTIVE',surface:'Hybrid Link / Build Out',proof:'R127 zero-drift one-click Windows connector generation + root-safe repair/bootstrap contract',remaining:'actual Windows installation/service execution and any EXE packaging remain DEVICE_PROOF_REQUIRED until the paired host returns proof'},
 S23:{successor:'WEB_ACTIVE',surface:'System',proof:'canonical Worker API + durable runtime transport + authenticated Hybrid HTTP transport endpoints',remaining:'historical/local WebSocket breadth remains separately proof-gated and is not inferred from HTTP availability'}
};

export const R48_COMPLETION_FAMILIES:CompletionFamily[]=FAMILIES.map(f=>({id:f.id,name:f.name,historical:f.status,...OVERRIDE[f.id]}));
export const R48_COMPLETION_SUMMARY=(()=>{
 const counts=Object.fromEntries(['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE','EVIDENCE_GATED','DEVICE_GATED'].map(k=>[k,R48_COMPLETION_FAMILIES.filter(x=>x.successor===k).length]));
 return {schema:'OMEGA_COMPLETION_CONVERGENCE_R48',families:R48_COMPLETION_FAMILIES.length,counts,restorationDebt:R48_COMPLETION_FAMILIES.filter(x=>['DONOR_ONLY','NATIVE_TARGET','RESTORATION_DEBT'].includes(x.successor)).length,executable:R48_COMPLETION_FAMILIES.filter(x=>['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'].includes(x.successor)).length,gated:R48_COMPLETION_FAMILIES.filter(x=>['EVIDENCE_GATED','DEVICE_GATED'].includes(x.successor)).length,boundary:'R48 is the current successor execution ledger. R154 promotes it into the one-system operational view and composes the admitted R153 adaptive mission engine. Historical V24 status remains immutable evidence; successor reality records what is executable now and what remains evidence/device gated. Gated is not broken, local/browser implementation is not native execution proof, and no successor can promote CanonState without the existing admission authority.'};
})();
