import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R121 '+msg)};
const sphere=read('src/OmegaEarthRelativitySphereR121.tsx');
const sphereCss=read('src/omegaEarthRelativitySphereR121.css');
const membrane=read('src/CanonicalMembraneR95.tsx');
const physics=read('src/OmegaPhysicsManifoldR132.tsx');
const woven=read('src/OmegaWovenRelativityContinuumR134.tsx');
const homeAuthority=read('src/physicsManifoldHomeAuthorityR132.css');
const launcher=read('src/sovereignLauncherR117.ts');

const directSphere=membrane.includes("import OmegaEarthRelativitySphereR121 from './OmegaEarthRelativitySphereR121'")&&membrane.includes('<OmegaEarthRelativitySphereR121 address={address} onAddress={onAddress} projection={projection} view={view}/>');
const delegatedR132=membrane.includes("import OmegaPhysicsManifoldR132 from './OmegaPhysicsManifoldR132'")&&membrane.includes('<OmegaPhysicsManifoldR132 address={address} onAddress={onAddress} projection={projection} view={view}/>')&&physics.includes("import OmegaEarthRelativitySphereR121 from './OmegaEarthRelativitySphereR121'")&&physics.includes('<OmegaEarthRelativitySphereR121 address={address} onAddress={onAddress} projection={projection} view={view}/>');
const delegatedR134=membrane.includes("import OmegaWovenRelativityContinuumR134 from './OmegaWovenRelativityContinuumR134'")&&membrane.includes('<OmegaWovenRelativityContinuumR134 address={address} onAddress={onAddress} projection={projection} view={view}/>')&&woven.includes("import OmegaEarthRelativitySphereR121 from './OmegaEarthRelativitySphereR121'")&&woven.includes('<OmegaEarthRelativitySphereR121 address={address} onAddress={onAddress} projection={projection} view={view}/>');
must(directSphere||delegatedR132||delegatedR134,'whole-sphere instrument must remain reachable through canonical Home visual authority, directly or through a proven successor');
must(membrane.includes("const homeComposite=compact&&label.startsWith('HOME ·')"),'Home compact membrane integration gate must remain');
must(membrane.includes("className='r121-home-membrane'")&&membrane.includes('CANONICAL SOURCE MEMBRANE · OPEN 20,736-CELL INSPECTION SURFACE'),'20,736-cell membrane must remain directly reachable as source-truth inspection');
for(const token of ['EARTH_RADIUS_KM=6371','EARTH_ROTATION_RAD_S=7.292115e-5','SURFACE_G=9.80665','INNER CORE','OUTER CORE','LOWER MANTLE','TRANSITION 410 km','TROPOSPHERE','THERMOSPHERE REF'])must(sphere.includes(token),'Earth reference layer missing '+token);
for(const token of ["SphereLens='WHOLE'|'CUTAWAY'|'EVIDENCE'|'CANON'|'SPACE'",'/api/earth/evidence','/api/earth/noaa/catalog','/api/earth/noaa/image','STATE_COUNT','compileSourceTraversal','CANONICAL RADIAL LAYERS ARE REPRESENTATIONAL','not physical dimensions','REFERENCE = published Earth constants','No satellite coverage returned; nothing synthetic substituted'])must(sphere.includes(token),'whole-sphere truth/source contract missing '+token);
must(sphere.includes('atlas resolution · not physical dimensions')||sphere.includes('atlas address resolution · not physical dimensions'),'atlas resolution truth boundary must explicitly reject literal physical dimensions');
must(sphere.includes('for(let i=0;i<STATE_COUNT;i++)'),'canonical spherical field must traverse the full 20,736-address registry rather than a decorative sample');
must(sphere.includes('onDoubleClick={choose}')&&sphere.includes('atlasAddress(d,p,r,l)'),'sphere surface must be an interactive address-navigation instrument');
must(sphereCss.includes('.r121-sphere-body')&&sphereCss.includes('@media(max-width:820px)')&&sphereCss.includes('@media(max-width:620px)'),'whole-sphere UI must have desktop and mobile layout authority');
must(directSphere?sphereCss.includes('Whole-sphere integrative view is primary;'):delegatedR134?homeAuthority.includes('Woven relativity continuum is primary;'):homeAuthority.includes('Relational physics manifold is primary;'),'Home projection copy must communicate current manifold/Earth/membrane authority correctly');

const cmdSafe="s.startswith(chr(35)+chr(33)+'/usr/bin/env python3') and 'OMEGA R34 local Hybrid Link agent' in s and 'https://omegav6.jeffdeweyeljefe.workers.dev' in s and 'Pairing is explicit.' in s";
must(launcher.includes(cmdSafe),'Hybrid agent validator must construct the shebang without a literal ! under CMD delayed expansion');
must(launcher.includes("'OMEGA Sovereign RCWA transport agent' in s")&&launcher.includes("s.startswith(chr(35)+chr(33)+'/usr/bin/env python3')"),'RCWA validator must use the same CMD-safe shebang construction');
must(launcher.includes('R120.3_CMD_SAFE')&&launcher.includes('no literal exclamation mark is permitted inside this inline Python'),'launcher must expose the CMD-safe validator build and its shell invariant');
must(!launcher.includes("s.startswith('#//omegav6.jeffdeweyeljefe.workers.dev' in s")&&!launcher.includes("s.startswith('#!/usr/bin/env python3' in s"),'malformed R120 screenshot validator pattern must never regress');
must(launcher.includes("replace(/[\\r\\n\"!%&|<>^]/g,''"),'pairing code sanitizer must neutralize CMD delayed and percent expansion metacharacters');
must(launcher.includes('The connector did not execute unvalidated source.'),'fail-closed Hybrid execution boundary must remain');

console.log('R121 PASS · Earth sphere retained inside current Home visual authority · full canonical field · source-backed Earth/satellite evidence · CMD-safe connector validator regression sealed');
