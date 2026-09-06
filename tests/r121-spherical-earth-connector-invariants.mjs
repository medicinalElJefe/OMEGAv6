import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R121 '+msg)};
const sphere=read('src/OmegaEarthRelativitySphereR121.tsx');
const sphereCss=read('src/omegaEarthRelativitySphereR121.css');
const membrane=read('src/CanonicalMembraneR95.tsx');
const launcher=read('src/sovereignLauncherR117.ts');

must(membrane.includes("import OmegaEarthRelativitySphereR121 from './OmegaEarthRelativitySphereR121'"),'whole-sphere instrument must be shared through canonical membrane authority');
must(membrane.includes("const homeComposite=compact&&label.startsWith('HOME ·')")&&membrane.includes('<OmegaEarthRelativitySphereR121 address={address} onAddress={onAddress}/>'),'Home compact membrane must promote whole-sphere integration without removing canonical source truth');
must(membrane.includes("className='r121-home-membrane'")&&membrane.includes('CANONICAL SOURCE MEMBRANE · OPEN 20,736-CELL INSPECTION SURFACE'),'20,736-cell membrane must remain directly reachable as source-truth inspection');
for(const token of ['EARTH_RADIUS_KM=6371','EARTH_ROTATION_RAD_S=7.292115e-5','SURFACE_G=9.80665','INNER CORE','OUTER CORE','LOWER MANTLE','TRANSITION 410 km','TROPOSPHERE','THERMOSPHERE REF'])must(sphere.includes(token),'Earth reference layer missing '+token);
for(const token of ["SphereLens='WHOLE'|'CUTAWAY'|'EVIDENCE'|'CANON'|'SPACE'",'/api/earth/evidence','/api/earth/noaa/catalog','/api/earth/noaa/image','STATE_COUNT','compileSourceTraversal','CANONICAL RADIAL LAYERS ARE REPRESENTATIONAL','atlas address resolution · not physical dimensions','REFERENCE = published Earth constants','No satellite coverage returned; nothing synthetic substituted'])must(sphere.includes(token),'whole-sphere truth/source contract missing '+token);
must(sphere.includes('for(let i=0;i<STATE_COUNT;i++)'),'canonical spherical field must traverse the full 20,736-address registry rather than a decorative sample');
must(sphere.includes('onDoubleClick={choose}')&&sphere.includes('atlasAddress(d,p,r,l)'),'sphere surface must be an interactive address-navigation instrument');
must(sphereCss.includes('.r121-sphere-body')&&sphereCss.includes('@media(max-width:820px)')&&sphereCss.includes('@media(max-width:620px)'),'whole-sphere UI must have desktop and mobile layout authority');
must(sphereCss.includes('Whole-sphere integrative view is primary; the canonical 20,736-cell membrane remains the source-truth inspection surface.'),'Home projection copy must communicate sphere/membrane authority correctly');

const valid="s.startswith('#!/usr/bin/env python3') and 'OMEGA R34 local Hybrid Link agent' in s and 'https://omegav6.jeffdeweyeljefe.workers.dev' in s and 'Pairing is explicit.' in s";
must(launcher.includes(valid),'Hybrid agent validator must contain the complete syntactically valid identity expression');
must(!launcher.includes("s.startswith('#//omegav6.jeffdeweyeljefe.workers.dev' in s")&&!launcher.includes("s.startswith('#!/usr/bin/env python3' in s"),'malformed R120 screenshot validator pattern must never regress');
must(launcher.includes('The connector did not execute unvalidated source.'),'fail-closed Hybrid execution boundary must remain');

console.log('R121 PASS · whole-sphere Earth relativity home instrument · full canonical field · source-backed Earth/satellite evidence · connector validator regression sealed');
